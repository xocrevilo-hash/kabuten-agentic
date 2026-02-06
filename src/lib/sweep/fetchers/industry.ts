/**
 * Fetches industry-level data via Claude web search.
 * Covers SEMI, WSTS, peer company announcements, and analyst coverage.
 */
import { webSearch } from "@/lib/claude";

export async function fetchIndustry(
  companyName: string,
  sector: string
): Promise<string> {
  try {
    const query = `${sector} industry news SEMI WSTS semiconductor equipment market orders shipments analyst ${companyName} peers latest`;
    return await webSearch(query);
  } catch (error) {
    return `Industry search failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
