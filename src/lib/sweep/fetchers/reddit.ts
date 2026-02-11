/**
 * Fetches Reddit discussions via Claude web search.
 * Falls back to web search since Reddit OAuth2 API requires setup.
 * TODO: Add Reddit OAuth2 API integration when credentials are configured.
 */
import { webSearch } from "@/lib/claude";

export async function fetchReddit(
  companyName: string,
  ticker: string
): Promise<string> {
  try {
    const query = `site:reddit.com ${companyName} OR $${ticker} investing semiconductor`;
    return await webSearch(query);
  } catch (error) {
    return `Reddit search failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
