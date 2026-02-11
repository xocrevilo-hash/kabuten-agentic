import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export const maxDuration = 300;

// FX pairs for Yahoo Finance (local currency per 1 USD)
const CURRENCY_FX_PAIRS: Record<string, string> = {
  Japan: "JPYUSD=X",
  Korea: "KRWUSD=X",
  Taiwan: "TWDUSD=X",
  China: "CNYUSD=X",
  "Hong Kong": "HKDUSD=X",
  India: "INRUSD=X",
  Australia: "AUDUSD=X",
  Singapore: "SGDUSD=X",
};

/**
 * GET /api/portfolio/snapshot
 * Cron trigger: daily NAV snapshot + price fetch for all holdings.
 * Uses Claude web search to fetch Yahoo Finance prices.
 */
export async function GET() {
  try {
    const { initializeDatabase, getPortfolioHoldings, getPortfolioSnapshots, insertPortfolioSnapshot } = await import("@/lib/db");
    await initializeDatabase();

    const holdings = await getPortfolioHoldings(true);

    if (holdings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active holdings — skipping NAV snapshot.",
        nav: null,
        timestamp: new Date().toISOString(),
      });
    }

    // Build list of tickers to fetch
    const tickerList = holdings.map((h: Record<string, unknown>) => h.ticker_full as string);

    // Fetch current prices via Claude web search
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let priceData: Record<string, { price: number; currency: string }> = {};

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 } as any],
        messages: [
          {
            role: "user",
            content: `Look up the current stock prices for these tickers on Yahoo Finance: ${tickerList.join(", ")}

For each ticker, provide the current price and currency.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "prices": {
    "TICKER": { "price": 123.45, "currency": "USD" or "JPY" or "KRW" etc },
    ...
  }
}

Use the closing price or most recent available price. Include all tickers even if you need to estimate.`,
          },
        ],
      });

      const rawText = response.content
        .filter((block) => block.type === "text")
        .map((block) => ("text" in block ? block.text : ""))
        .join("");

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      }

      if (parsed?.prices) {
        priceData = parsed.prices;
      }
    } catch (error) {
      console.error("Price fetch error:", error);
    }

    // Fetch FX rates if we have non-USD holdings
    const countriesNeeded = new Set<string>();
    for (const h of holdings) {
      const country = (h as Record<string, unknown>).country as string;
      if (country && country !== "US" && CURRENCY_FX_PAIRS[country]) {
        countriesNeeded.add(country);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fxRates: Record<string, number> = {};
    if (countriesNeeded.size > 0) {
      try {
        const fxPairs = Array.from(countriesNeeded).map((c) => CURRENCY_FX_PAIRS[c]).filter(Boolean);
        const fxResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1024,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 } as any],
          messages: [
            {
              role: "user",
              content: `Look up current exchange rates for: ${fxPairs.join(", ")} on Yahoo Finance.

Respond ONLY with valid JSON:
{
  "rates": {
    "JPY": 150.5,
    "KRW": 1350.0,
    ...
  }
}

Provide the number of units of local currency per 1 USD.`,
            },
          ],
        });

        const fxRawText = fxResponse.content
          .filter((block) => block.type === "text")
          .map((block) => ("text" in block ? block.text : ""))
          .join("");

        let fxParsed;
        try {
          fxParsed = JSON.parse(fxRawText);
        } catch {
          const jsonMatch = fxRawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            fxParsed = JSON.parse(jsonMatch[0]);
          }
        }

        if (fxParsed?.rates) {
          fxRates = fxParsed.rates;
        }
      } catch (error) {
        console.error("FX rate fetch error:", error);
      }
    }

    // Calculate NAV
    const previousSnapshots = await getPortfolioSnapshots(1);
    const previousNav = previousSnapshots.length > 0 ? (previousSnapshots[0].nav as number) : 100.0;

    let totalReturn = 0;
    const holdingsDetail: {
      company_id: string;
      ticker: string;
      current_price_usd: number | null;
      entry_price_usd: number | null;
      stock_return: number;
      weight: number;
    }[] = [];

    for (const h of holdings) {
      const holding = h as Record<string, unknown>;
      const ticker = holding.ticker_full as string;
      const entryPriceUsd = holding.entry_price_usd as number | null;
      const initialWeight = (holding.initial_weight as number) || 0.05;

      let currentPriceUsd: number | null = null;

      if (priceData[ticker]) {
        const { price, currency } = priceData[ticker];
        if (currency === "USD" || !currency) {
          currentPriceUsd = price;
        } else {
          const fxRate = fxRates[currency] || 1;
          currentPriceUsd = price / fxRate;
        }
      }

      let stockReturn = 0;
      if (entryPriceUsd && entryPriceUsd > 0 && currentPriceUsd && currentPriceUsd > 0) {
        stockReturn = (currentPriceUsd / entryPriceUsd) - 1;
      }

      totalReturn += initialWeight * stockReturn;

      holdingsDetail.push({
        company_id: holding.company_id as string,
        ticker,
        current_price_usd: currentPriceUsd,
        entry_price_usd: entryPriceUsd,
        stock_return: stockReturn,
        weight: initialWeight,
      });
    }

    const newNav = previousNav * (1 + totalReturn);
    const dailyReturn = previousNav > 0 ? (newNav / previousNav) - 1 : 0;

    const today = new Date().toISOString().split("T")[0];

    await insertPortfolioSnapshot({
      snapshotDate: today,
      nav: newNav,
      dailyReturn,
      holdingsJson: holdingsDetail,
      kabutenView: null, // Generated separately on composition changes
    });

    return NextResponse.json({
      success: true,
      message: `Daily NAV snapshot complete. NAV: ${newNav.toFixed(2)} (${dailyReturn >= 0 ? "+" : ""}${(dailyReturn * 100).toFixed(2)}%)`,
      nav: newNav,
      dailyReturn,
      holdingsCount: holdings.length,
      pricesFound: Object.keys(priceData).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Portfolio snapshot error:", error);
    return NextResponse.json(
      { success: false, message: "Portfolio snapshot failed: " + String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST() {
  return GET();
}
