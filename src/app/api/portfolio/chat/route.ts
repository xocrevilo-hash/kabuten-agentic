import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { query, history } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const { initializeDatabase, getPortfolioHoldings, getPortfolioSnapshots, getPortfolioChanges, getActionLog } = await import("@/lib/db");
    await initializeDatabase();

    // Gather portfolio context
    const holdings = await getPortfolioHoldings(true);
    const snapshots = await getPortfolioSnapshots(7);
    const changes = await getPortfolioChanges(30);
    const recentAgentLogs = await getActionLog(undefined, 30);

    // Build context for Claude
    const holdingsContext = holdings.length > 0
      ? holdings.map((h: Record<string, unknown>) =>
          `- ${h.company_name} (${h.ticker_full}): weight=${((h.initial_weight as number) * 100).toFixed(1)}%, conviction=${h.conviction}, view=${h.investment_view}, entry=${h.entry_date}`
        ).join("\n")
      : "No active holdings yet. Portfolio will be initialized with top 20 highest conviction ideas.";

    const latestNav = snapshots.length > 0 ? (snapshots[0].nav as number) : 100.0;
    const navContext = snapshots.length > 0
      ? `Current NAV: ${latestNav.toFixed(2)} (inception at 100.0)\nRecent snapshots:\n${snapshots.slice(0, 5).map((s: Record<string, unknown>) =>
          `  ${s.snapshot_date}: NAV=${(s.nav as number).toFixed(2)}, daily return=${((s.daily_return as number) * 100).toFixed(2)}%`
        ).join("\n")}`
      : "No NAV snapshots yet — portfolio not yet initialized.";

    const changesContext = changes.length > 0
      ? changes.slice(0, 15).map((c: Record<string, unknown>) =>
          `- ${c.change_date} ${c.action}: ${c.company_name} (${c.ticker_full}) — ${c.reason}`
        ).join("\n")
      : "No portfolio changes yet.";

    const agentContext = recentAgentLogs.length > 0
      ? recentAgentLogs.slice(0, 15).map((a: Record<string, unknown>) =>
          `- ${a.company_name}: [${a.severity}] ${a.summary}`
        ).join("\n")
      : "No recent agent activity.";

    const kabutenView = snapshots.length > 0 && snapshots[0].kabuten_view
      ? (snapshots[0].kabuten_view as string)
      : "Portfolio will be initialized on 9 Feb 2026 with the top 20 highest conviction ideas from all covered companies.";

    const systemPrompt = `You are Kabuten's Portfolio Constructor — an AI analyst managing a concentrated portfolio of 20 high-conviction stocks focused on Japanese, APAC, and global semiconductor/technology companies.

CURRENT PORTFOLIO STATE:
${holdingsContext}

NAV & RETURNS:
${navContext}

LATEST KABUTEN VIEW:
${kabutenView}

RECENT PORTFOLIO CHANGES:
${changesContext}

RECENT AGENT ACTIVITY (last 7 days):
${agentContext}

PORTFOLIO RULES:
- Equal-weighted at entry (5% each for 20 stocks)
- No rebalancing — weights drift naturally with returns
- USD-denominated returns
- Stocks added/removed based on agent conviction changes
- Top 20 highest conviction "bullish" ideas across all 230 covered companies

Answer questions about the portfolio in a direct, analyst-like tone. Reference specific holdings, agent activity, and data when relevant. If asked about potential changes, reference the agent logs and conviction levels. Keep responses concise but informative.`;

    // Build conversation history
    const conversationHistory: { role: "user" | "assistant"; content: string }[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        conversationHistory.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }
    }
    conversationHistory.push({ role: "user", content: query });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: systemPrompt,
      messages: conversationHistory,
    });

    const answer = response.content
      .filter((block) => block.type === "text")
      .map((block) => ("text" in block ? block.text : ""))
      .join("");

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Portfolio chat error:", error);
    return NextResponse.json(
      { error: "Portfolio chat failed: " + String(error) },
      { status: 500 }
    );
  }
}
