import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
 * Send a PM message to a sector agent and get a reply.
 * Body: { sector_key: string, message: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sector_key, message } = body;

    if (!sector_key || !message) {
      return NextResponse.json(
        { error: "sector_key and message are required" },
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

    // Load thread history
    const thread = await getAgentThread(sector_key);
    const threadHistory: unknown[] = Array.isArray(thread?.thread_history) ? [...(thread.thread_history as unknown[])] : [];

    // Build messages for Claude from recent thread history
    const recentEntries = threadHistory.slice(-20) as Array<{ type?: string; content?: string; role?: string }>;
    const chatMessages: { role: "user" | "assistant"; content: string }[] = [];
    for (const entry of recentEntries) {
      if (entry.type === "pm_message" && entry.content) {
        chatMessages.push({ role: "user", content: entry.content });
      } else if (entry.type === "agent_response" && entry.content) {
        chatMessages.push({ role: "assistant", content: entry.content });
      } else if (entry.type === "sweep") {
        // Include sweep summaries as context
        const sweepEntry = entry as Record<string, unknown>;
        chatMessages.push({
          role: "assistant",
          content: `[Sweep completed] ${sweepEntry.summary || "Daily sweep processed."}`,
        });
      }
    }

    // Add the new message
    chatMessages.push({ role: "user", content: message });

    // Call Claude
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: (
        `You are ${agentCtx.designation}, the lead sector analyst for ${agentCtx.name}. ` +
        `${agentCtx.context}\n\n` +
        "You are conversing with the Portfolio Manager (PM). " +
        "Draw on your sector knowledge to provide insightful, data-driven responses. " +
        "Be concise and specific. Use tickers and data points where possible."
      ),
      messages: chatMessages,
    });

    let reply = "";
    for (const block of response.content) {
      if (block.type === "text") {
        reply += block.text;
      }
    }

    // Append both messages to thread
    threadHistory.push({
      role: "user",
      type: "pm_message",
      timestamp: new Date().toISOString(),
      content: message,
    });
    threadHistory.push({
      role: "assistant",
      type: "agent_response",
      timestamp: new Date().toISOString(),
      content: reply,
    });

    // Save thread
    await saveAgentThread(sector_key, threadHistory);

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
