/**
 * Fetches the latest content from a company's Investor Relations page.
 * Uses direct HTTP fetch for static HTML pages.
 */

const IR_PAGES: Record<string, string> = {
  "8035": "https://www.tel.com/ir/",
  "6146": "https://www.disco.co.jp/eg/ir/",
  "6857": "https://www.advantest.com/investors",
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
