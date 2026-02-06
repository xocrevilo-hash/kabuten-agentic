/**
 * Fetches Twitter/X sentiment via Claude web search.
 * Supplements MCP integration (which provides direct account access).
 */
import { webSearch } from "@/lib/claude";

export async function fetchTwitter(
  companyName: string,
  ticker: string
): Promise<string> {
  try {
    const query = `site:x.com OR site:twitter.com ${companyName} OR ${ticker} semiconductor equipment`;
    return await webSearch(query);
  } catch (error) {
    return `Twitter search failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
