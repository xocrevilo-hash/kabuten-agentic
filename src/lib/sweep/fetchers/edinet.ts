/**
 * Checks EDINET for new regulatory filings.
 * EDINET is Japan's EDGAR equivalent — hosts yuho (annual), quarterly reports.
 * Uses the EDINET API v2 to search for recent filings.
 *
 * NOTE: EDINET only covers Japanese-listed companies (TSE).
 * Non-Japanese companies (TWSE, KRX, SZSE, HKEX, NYSE) are not in EDINET.
 */

// EDINET company codes (edinetCode) for Japanese-listed companies only
const EDINET_CODES: Record<string, string> = {
  "8035": "E01888", // Tokyo Electron
  "6146": "E01622", // Disco Corporation
  "6857": "E01972", // Advantest
  "6501": "E01737", // Hitachi
  "6920": "E02tried", // Lasertec — placeholder, needs verification
  "6752": "E01772", // Panasonic
  "6323": "E02606", // Rorze
  "7735": "E01846", // Screen Holdings
};

export async function fetchEdinet(companyId: string): Promise<string> {
  const edinetCode = EDINET_CODES[companyId];
  if (!edinetCode) {
    return `No EDINET code for company ${companyId} (EDINET covers Japanese-listed companies only)`;
  }

  try {
    // EDINET API v2 — search for documents filed in the last 7 days
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateStr = weekAgo.toISOString().split("T")[0];

    const url = `https://api.edinet-fsa.go.jp/api/v2/documents.json?date=${dateStr}&type=2&Subscription-Key=${process.env.EDINET_API_KEY || ""}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return `EDINET API returned status ${response.status}`;
    }

    const data = await response.json();

    // Filter for our specific company
    interface EdinetDocument {
      edinetCode: string;
      docDescription: string;
      submitDateTime: string;
      docID: string;
    }

    const filings = (data.results || []).filter(
      (doc: EdinetDocument) => doc.edinetCode === edinetCode
    );

    if (filings.length === 0) {
      return `No new EDINET filings found for ${edinetCode} in the last 7 days.`;
    }

    return filings
      .map(
        (f: EdinetDocument) =>
          `Filing: ${f.docDescription} | Submitted: ${f.submitDateTime} | ID: ${f.docID}`
      )
      .join("\n");
  } catch (error) {
    return `EDINET fetch failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
