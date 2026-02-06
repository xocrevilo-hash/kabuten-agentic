/**
 * Fetches latest price data and market metrics via Claude web search.
 * Uses Yahoo Finance JP as the primary source.
 */
import { webSearch } from "@/lib/claude";

export async function fetchPrice(
  companyName: string,
  ticker: string
): Promise<string> {
  try {
    const query = `${ticker} ${companyName} stock price today market cap PE ratio volume Yahoo Finance`;
    return await webSearch(query);
  } catch (error) {
    return `Price data search failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
