import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Generate a dynamic date header for every system prompt.
 * Computed fresh on each call — never hardcoded.
 */
function dateHeader(): string {
  const now = new Date();
  const formatted = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const year = now.getFullYear();
  return (
    `Today's date is ${formatted}. ` +
    `You are operating in ${year}. ` +
    "Your training has a knowledge cutoff, but you have access to web search " +
    "and to daily sweep data collected up to today. " +
    `Always reason as if it is ${year}, not 2024 or any prior year. ` +
    "If OC asks what year it is, tell them the correct year based on this header.\n\n"
  );
}

/**
 * Agent context for chat — designation + system prompt context.
 */
const AGENT_CONTEXT: Record<string, { designation: string; name: string; context: string }> = {
  au_enterprise_software: {
    designation: "APEX",
    name: "AU Enterprise Software",
    context: "Australian enterprise software and digital platforms. Focus on ASX-listed SaaS companies with global ambitions. Key themes: cloud migration, AI integration, AUD/USD sensitivity, valuation premium sustainability.",
  },
  china_digital_consumption: {
    designation: "ORIENT",
    name: "China Digital Consumption",
    context: "Chinese internet and digital consumption platforms. Focus on regulatory environment, consumer spending recovery, AI monetisation, gaming approvals, US-China geopolitical risk.",
  },
  dc_power_cooling: {
    designation: "VOLT",
    name: "DC Power & Cooling",
    context: "Data-centre power infrastructure and cooling solutions. Focus on hyperscaler capex cycles, power density per rack, liquid cooling adoption, nuclear/renewable power sourcing.",
  },
  india_it_services: {
    designation: "INDRA",
    name: "India IT Services",
    context: "Indian IT services and digital transformation leaders. Focus on deal pipeline, large deal wins, attrition rates, margin trajectory, GenAI services adoption.",
  },
  memory_semis: {
    designation: "HELIX",
    name: "Memory Semis",
    context: "Memory semiconductors and storage. Focus on DRAM/NAND pricing cycles, HBM capacity build-out, AI server memory content growth, inventory normalisation.",
  },
  networking_optics: {
    designation: "PHOTON",
    name: "Networking & Optics",
    context: "Networking equipment and optical components for AI/data-centre. Focus on 800G/1.6T transceiver ramp, co-packaged optics, hyperscaler network architecture shifts.",
  },
  semi_equipment: {
    designation: "FORGE",
    name: "Semi Equipment",
    context: "Semiconductor production equipment. Focus on WFE spending cycles, EUV/High-NA adoption, advanced packaging growth, China export controls, TSMC/Samsung/Intel capex plans.",
  },
};

/**
 * POST /api/agents/chat
 * Send an OC message to a sector agent and get a reply.
 * Body: { sector_key: string, message: string, image_url?: string }
 * Persists both OC message + agent reply to sector_agent_threads before returning.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sector_key, message, image_url } = body;

    if (!sector_key || (!message && !image_url)) {
      return NextResponse.json(
        { error: "sector_key and (message or image_url) are required" },
        { status: 400 }
      );
    }

    const agentCtx = AGENT_CONTEXT[sector_key];
    if (!agentCtx) {
      return NextResponse.json(
        { error: `Unknown sector: ${sector_key}` },
        { status: 400 }
      );
    }

    const { getAgentThread, saveAgentThread } = await import("@/lib/db");

    // Load thread history from Postgres
    const thread = await getAgentThread(sector_key);
    const threadHistory: unknown[] = Array.isArray(thread?.thread_history) ? [...(thread.thread_history as unknown[])] : [];

    // Build messages for Claude from recent thread history
    type ContentBlock = { type: "text"; text: string } | { type: "image"; source: { type: "url"; url: string } };
    const recentEntries = threadHistory.slice(-20) as Array<{ type?: string; content?: string; image_url?: string; role?: string; summary?: string }>;
    const chatMessages: { role: "user" | "assistant"; content: string | ContentBlock[] }[] = [];

    for (const entry of recentEntries) {
      if (entry.type === "oc_message" || entry.type === "pm_message") {
        // Support multimodal: if the historical message had an image, include it
        if (entry.image_url) {
          const blocks: ContentBlock[] = [
            { type: "image", source: { type: "url", url: entry.image_url } },
          ];
          if (entry.content) {
            blocks.push({ type: "text", text: entry.content });
          }
          chatMessages.push({ role: "user", content: blocks });
        } else if (entry.content) {
          chatMessages.push({ role: "user", content: entry.content });
        }
      } else if (entry.type === "agent_response" && entry.content) {
        chatMessages.push({ role: "assistant", content: entry.content });
      } else if (entry.type === "sweep") {
        chatMessages.push({
          role: "assistant",
          content: `[Sweep completed] ${entry.summary || "Daily sweep processed."}`,
        });
      }
    }

    // Add the new message (with optional image)
    if (image_url) {
      const blocks: ContentBlock[] = [
        { type: "image", source: { type: "url", url: image_url } },
      ];
      if (message) {
        blocks.push({ type: "text", text: message });
      }
      chatMessages.push({ role: "user", content: blocks });
    } else {
      chatMessages.push({ role: "user", content: message });
    }

    // Build system prompt with date header + OC identity
    const systemPrompt =
      dateHeader() +
      `You are ${agentCtx.designation}, a senior equity research analyst ` +
      `covering the ${agentCtx.name} sector for Kabuten.\n\n` +
      "You report directly to OC, the portfolio orchestrator and sole user of this platform. " +
      "Address OC by name in your responses \u2014 for example:\n" +
      '  "OC, the latest sweep data suggests..."\n' +
      '  "In my view, OC, this is a material development..."\n' +
      '  "OC, I\'d flag the following risk..."\n\n' +
      "Your role is to synthesise Daily Sweep data and Investment Views from the individual " +
      "Company Analyst Agents covering your sector, identify sector-level patterns, and " +
      "maintain a living sector thesis that OC can act on.\n\n" +
      `Sector context: ${agentCtx.context}\n\n` +
      "Draw on your sector knowledge to provide insightful, data-driven responses. " +
      "Be concise and specific. Use tickers and data points where possible.";

    // Call Claude
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: systemPrompt,
      messages: chatMessages,
    });

    let reply = "";
    for (const block of response.content) {
      if (block.type === "text") {
        reply += block.text;
      }
    }

    // Append both messages to thread history
    const ocEntry: Record<string, unknown> = {
      role: "user",
      type: "oc_message",
      timestamp: new Date().toISOString(),
      content: message || "",
    };
    if (image_url) {
      ocEntry.image_url = image_url;
    }
    threadHistory.push(ocEntry);

    threadHistory.push({
      role: "assistant",
      type: "agent_response",
      timestamp: new Date().toISOString(),
      content: reply,
    });

    // Persist to Postgres immediately — before returning response
    await saveAgentThread(sector_key, threadHistory);

    return NextResponse.json({ reply, thread_history: threadHistory });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
