/**
 * Fetches latest news via Claude web search.
 * Covers Reuters, Nikkei, and general financial news sources.
 */
import { webSearch } from "@/lib/claude";

export async function fetchNews(
  companyName: string,
  ticker: string
): Promise<string> {
  try {
    const query = `${companyName} ${ticker} latest news financial results orders announcements today this week`;
    return await webSearch(query);
  } catch (error) {
    return `News search failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
