import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { query, source, history } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const sourceScope = source || "kabuten";

    // Build context based on source scope
    let kabutenContext = "";
    if (sourceScope === "kabuten" || sourceScope === "all") {
      try {
        const { getDb } = await import("@/lib/db");
        const sql = getDb();

        // Search action_log for relevant entries
        const logs = await sql`
          SELECT al.summary, al.severity, al.timestamp, al.detail_json, c.name, c.ticker_full, c.investment_view, c.conviction
          FROM action_log al
          JOIN companies c ON al.company_id = c.id
          ORDER BY al.timestamp DESC
          LIMIT 50
        `;

        // Get all companies summary
        const companies = await sql`
          SELECT id, name, ticker_full, investment_view, conviction, sector, country, market_cap_usd
          FROM companies
          ORDER BY market_cap_usd DESC NULLS LAST
          LIMIT 230
        `;

        kabutenContext = `\n\nKABUTEN DATABASE CONTEXT:

COVERAGE UNIVERSE (${companies.length} companies):
${companies.map((c: Record<string, unknown>) =>
  `- ${c.name} (${c.ticker_full}) — ${c.investment_view}/${c.conviction} — ${c.sector} — ${c.country}`
).join("\n")}

RECENT ANALYST AGENT LOG (last 50 entries):
${logs.map((l: Record<string, unknown>) =>
  `[${new Date(l.timestamp as string).toLocaleDateString("en-GB")}] ${l.name} (${l.ticker_full}) — ${l.severity}: ${l.summary}`
).join("\n")}`;
      } catch {
        kabutenContext = "\n\nNote: Database not available. Answering from general knowledge.";
      }
    }

    // Build conversation history for Claude
    const conversationHistory: { role: "user" | "assistant"; content: string }[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        conversationHistory.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }
    conversationHistory.push({ role: "user", content: query });

    // Build system prompt based on source scope
    let systemPrompt = `You are Kabuten, an AI equity research analyst specializing in technology and semiconductor stocks across the US and Asia-Pacific markets. You cover 230 companies.

Your role is to answer questions about your coverage universe, investment views, and market dynamics. Be concise, specific, and cite evidence from your sweep data where available.

Source scope: ${sourceScope}
`;

    if (sourceScope === "kabuten") {
      systemPrompt += `\nYou should ONLY answer based on the Kabuten database context provided below. If the information is not in your database, say so.${kabutenContext}`;
    } else if (sourceScope === "claude") {
      systemPrompt += `\nAnswer using your general knowledge about these companies and markets. Do not perform web searches.`;
    } else if (sourceScope === "all") {
      systemPrompt += `\nUse all available sources: Kabuten database, your general knowledge, and web search.${kabutenContext}`;
    }
    // For "internet" scope, we use web search tool

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools: any[] = [];
    if (sourceScope === "internet" || sourceScope === "all") {
      tools.push({
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 3,
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: systemPrompt,
      tools: tools.length > 0 ? tools : undefined,
      messages: conversationHistory,
    });

    // Extract text from response
    const textBlocks = response.content.filter(
      (block) => block.type === "text"
    );
    const answer = textBlocks.map((block) => "text" in block ? block.text : "").join("\n\n") || "I couldn't generate a response. Please try rephrasing your question.";

    // Save to question history log
    try {
      const { insertAskKabutenLog } = await import("@/lib/db");
      await insertAskKabutenLog({ query, answer, source: sourceScope });
    } catch {
      // Non-critical — don't fail the response if logging fails
    }

    return NextResponse.json({ answer, source: sourceScope });
  } catch (error) {
    console.error("Ask Kabuten error:", error);
    return NextResponse.json(
      { error: "Failed to process query", answer: "Sorry, an error occurred. Please try again." },
      { status: 500 }
    );
  }
}
