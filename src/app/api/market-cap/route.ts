import { NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * Fetches market cap from Yahoo Finance JSON API for a given ticker.
 * Returns market cap in USD billions, or null if not found.
 */
async function fetchYahooMarketCap(ticker: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Kabuten/1.0)",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    // regularMarketPrice and currency available in meta
    const price = meta.regularMarketPrice;
    const currency = meta.currency;

    if (!price) return null;

    // For market cap, we need the v10 quoteSummary endpoint
    const summaryUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=price`;
    const summaryRes = await fetch(summaryUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Kabuten/1.0)",
      },
    });

    if (summaryRes.ok) {
      const summaryData = await summaryRes.json();
      const priceModule = summaryData?.quoteSummary?.result?.[0]?.price;
      const marketCapRaw = priceModule?.marketCap?.raw;

      if (marketCapRaw && marketCapRaw > 0) {
        // Convert to USD billions
        let marketCapUsdBn = marketCapRaw / 1e9;

        // Convert non-USD currencies to USD
        if (currency && currency !== "USD") {
          const fxRate = await getUsdRate(currency);
          if (fxRate) {
            marketCapUsdBn = marketCapUsdBn * fxRate;
          }
        }

        return Math.round(marketCapUsdBn * 10) / 10; // 1 decimal precision
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fallback: Use Yahoo Finance v8 chart API to get price,
 * then estimate market cap from price * shares outstanding
 */
async function fetchYahooMarketCapFallback(ticker: string): Promise<number | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Kabuten/1.0)",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const quote = data?.quoteResponse?.result?.[0];
    if (!quote) return null;

    const marketCap = quote.marketCap;
    const currency = quote.currency || "USD";

    if (marketCap && marketCap > 0) {
      let marketCapUsdBn = marketCap / 1e9;

      if (currency !== "USD") {
        const fxRate = await getUsdRate(currency);
        if (fxRate) {
          marketCapUsdBn = marketCapUsdBn * fxRate;
        }
      }

      return Math.round(marketCapUsdBn * 10) / 10;
    }

    return null;
  } catch {
    return null;
  }
}

// Cache FX rates during a single refresh run
const fxCache: Record<string, number> = {};

async function getUsdRate(currency: string): Promise<number | null> {
  if (currency === "USD") return 1;
  if (fxCache[currency]) return fxCache[currency];

  try {
    const pair = `${currency}USD=X`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(pair)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Kabuten/1.0)",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price && price > 0) {
        fxCache[currency] = price;
        return price;
      }
    }

    // Common fallback rates (approximate, for when Yahoo FX fails)
    const fallbackRates: Record<string, number> = {
      JPY: 0.0067,
      KRW: 0.00073,
      TWD: 0.031,
      CNY: 0.14,
      HKD: 0.128,
      INR: 0.012,
      AUD: 0.65,
      GBP: 1.27,
      EUR: 1.08,
      SGD: 0.75,
    };

    if (fallbackRates[currency]) {
      fxCache[currency] = fallbackRates[currency];
      return fallbackRates[currency];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Maps company ticker_full to Yahoo Finance ticker format.
 * Most tickers work as-is; some need adjustments.
 */
function toYahooTicker(tickerFull: string, exchange: string): string {
  // Yahoo Finance ticker conventions:
  // US: AAPL (no suffix)
  // Japan TSE: 8035.T
  // Korea KRX: 005930.KS
  // Taiwan TWSE: 2330.TW
  // China SSE: 600000.SS, SZSE: 000001.SZ
  // Hong Kong HKEX: 0700.HK
  // India NSE: INFY.NS
  // Australia ASX: XRO.AX

  const t = tickerFull.trim();

  // Already has Yahoo suffix
  if (t.includes(".")) return t;

  // Map by exchange
  switch (exchange) {
    case "TSE":
      return `${t}.T`;
    case "KRX":
      return `${t}.KS`;
    case "TWSE":
      return `${t}.TW`;
    case "SSE":
      return `${t}.SS`;
    case "SZSE":
      return `${t}.SZ`;
    case "HKEX":
      return `${t}.HK`;
    case "NSE":
      return `${t}.NS`;
    case "BSE":
      return `${t}.BO`;
    case "ASX":
      return `${t}.AX`;
    default:
      // US stocks (NASDAQ/NYSE) — no suffix
      return t;
  }
}

/**
 * POST /api/market-cap
 * Refreshes market cap data for all companies using Yahoo Finance direct API.
 * Processes in batches of 5 with rate limiting.
 */
export async function POST() {
  try {
    const { initializeDatabase, getCompanies, updateCompanyMarketCap } = await import("@/lib/db");
    await initializeDatabase();
    const companies = await getCompanies();

    console.log(`[MarketCap] Starting Yahoo Finance refresh for ${companies.length} companies`);

    const BATCH_SIZE = 5;
    let updated = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
      const batch = companies.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map(async (c: Record<string, unknown>) => {
          const tickerFull = c.ticker_full as string;
          const exchange = (c.exchange as string) || "";
          const yahooTicker = toYahooTicker(tickerFull, exchange);

          // Try primary endpoint first, then fallback
          let marketCap = await fetchYahooMarketCap(yahooTicker);
          if (marketCap === null) {
            marketCap = await fetchYahooMarketCapFallback(yahooTicker);
          }

          if (marketCap !== null && marketCap > 0) {
            await updateCompanyMarketCap(c.id as string, marketCap);
            return { id: c.id, ticker: yahooTicker, marketCap, success: true };
          } else {
            return { id: c.id, ticker: yahooTicker, marketCap: null, success: false };
          }
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.success) {
          updated++;
        } else if (result.status === "fulfilled" && !result.value.success) {
          errors++;
          errorDetails.push(`${result.value.ticker}: no data`);
        } else if (result.status === "rejected") {
          errors++;
          errorDetails.push(`Error: ${result.reason}`);
        }
      }

      // Rate limit — 1s delay between batches
      if (i + BATCH_SIZE < companies.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`[MarketCap] Refresh complete: ${updated} updated, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: `Market cap refresh complete. ${updated}/${companies.length} companies updated via Yahoo Finance.`,
      updated,
      errors,
      errorDetails: errorDetails.length > 0 ? errorDetails.slice(0, 20) : undefined,
    });
  } catch (error) {
    console.error("[MarketCap] Fatal error:", error);
    return NextResponse.json(
      { success: false, message: `Market cap refresh failed: ${String(error)}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
