/**
 * Fetches the latest content from a company's Investor Relations page.
 * Uses direct HTTP fetch for static HTML pages.
 */

const IR_PAGES: Record<string, string> = {
  // Japan (TSE)
  "8035": "https://www.tel.com/ir/",
  "6146": "https://www.disco.co.jp/eg/ir/",
  "6857": "https://www.advantest.com/investors",
  "6501": "https://www.hitachi.com/IR-e/",
  "6920": "https://www.lasertec.co.jp/en/ir/",
  "6752": "https://www.panasonic.com/global/corporate/ir.html",
  "6323": "https://www.rorze.com/en/ir/",
  "7735": "https://www.screen.co.jp/eng/ir",
  // Taiwan (TWSE)
  "2345": "https://www.accton.com/investor-relations/",
  "2308": "https://www.deltaww.com/en-US/ir",
  "2317": "https://www.honhai.com/en-us/investor-relations",
  "2301": "https://www.liteon.com/en-us/investor",
  "2454": "https://corp.mediatek.com/investor-relations",
  "2408": "https://www.nanya.com/en/IR",
  "2330": "https://investor.tsmc.com/english",
  // Korea (KRX)
  "012450": "https://www.hanwhaaerospace.com/en/ir/",
  "007660": "https://www.isupetasys.com/en/ir/",
  "005930": "https://www.samsung.com/global/ir/",
  "000660": "https://www.skhynix.com/eng/ir/",
  // China (SZSE)
  "300502": "https://www.eoptolink.com/en/investor.html",
  "300308": "https://www.innolight.com/en/investor.html",
  // Hong Kong (HKEX)
  "9698": "https://www.gds-services.com/en/investors",
  // US (NYSE)
  "FN": "https://investor.fabrinet.com/",
};

export async function fetchIRPage(companyId: string): Promise<string> {
  const url = IR_PAGES[companyId];
  if (!url) {
    return `No IR page configured for company ${companyId}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KabutenBot/1.0; +https://kabuten-agentic.vercel.app)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return `IR page returned status ${response.status} for ${url}`;
    }

    const html = await response.text();

    // Extract meaningful text from the HTML — strip tags, scripts, styles
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Truncate to keep context window manageable
    return text.slice(0, 8000);
  } catch (error) {
    return `Failed to fetch IR page for ${companyId}: ${error instanceof Error ? error.message : String(error)}`;
  }
}
