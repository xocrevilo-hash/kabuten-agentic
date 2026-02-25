import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Agent definitions — matches agents/config.py.
 * sector_key → { designation, name, colour, companyIds }
 */
const AGENTS: Record<string, { designation: string; name: string; colour: string; companyIds: string[] }> = {
  au_enterprise_software:    { designation: "APEX",   name: "AU Enterprise Software",    colour: "#6366f1", companyIds: ["WTC", "XRO", "PME", "REA", "SEK"] },
  china_digital_consumption: { designation: "ORIENT", name: "China Digital Consumption",  colour: "#f59e0b", companyIds: ["9988", "BIDU", "NTES", "0700", "TME", "TCOM", "PDD"] },
  dc_power_cooling:          { designation: "VOLT",   name: "DC Power & Cooling",         colour: "#ef4444", companyIds: ["3324", "2308", "6501", "VST", "2301"] },
  india_it_services:         { designation: "INDRA",  name: "India IT Services",           colour: "#10b981", companyIds: ["INFY", "TCS", "TECHM", "WIPRO"] },
  memory_semis:              { designation: "HELIX",  name: "Memory Semis",                colour: "#8b5cf6", companyIds: ["285A", "MU", "005930", "SNDK", "STX", "000660", "2408"] },
  networking_optics:         { designation: "PHOTON", name: "Networking & Optics",          colour: "#06b6d4", companyIds: ["2345", "CLS", "COHR", "FN", "LITE", "300394", "300308", "300502"] },
  semi_equipment:            { designation: "FORGE",  name: "Semi Equipment",               colour: "#ec4899", companyIds: ["688082", "6857", "AMAT", "3711", "ASML", "6146", "6361", "7741", "KLAC", "6525", "LRCX", "6920", "6323", "7735", "8035", "7729", "002371"] },
  ev_supply_chain:           { designation: "SURGE",  name: "EV Supply-chain",              colour: "#84cc16", companyIds: ["TSLA", "1211", "300750", "1810", "373220"] },
  china_ai_apps:             { designation: "SYNTH",  name: "China AI Apps",                colour: "#a855f7", companyIds: ["0100", "2513"] },
  china_semis:               { designation: "DRAGON", name: "China Semis",                  colour: "#dc2626", companyIds: ["688981", "688256", "688041", "603501", "688008"] },
  japan_materials:           { designation: "TERRA",  name: "Japan Materials",              colour: "#78716c", companyIds: ["4004", "3110", "3436", "5016", "4062"] },
  gaming:                    { designation: "PIXEL",  name: "Gaming",                       colour: "#f97316", companyIds: ["7974", "6758", "9697", "EA", "TTWO"] },
  pcb_supply_chain:          { designation: "LAYER",  name: "PCB Supply-chain",             colour: "#0ea5e9", companyIds: ["007660", "2368", "3037", "1303"] },
  asean_ecommerce:           { designation: "TIDE",   name: "ASEAN E-commerce",             colour: "#14b8a6", companyIds: ["GRAB", "SE"] },
  ai_semis:                  { designation: "NOVA",   name: "AI Semis",                     colour: "#7c3aed", companyIds: ["2330", "NVDA", "AVGO", "AMD", "2454", "MRVL"] },
  mlccs:                     { designation: "FERRO",  name: "MLCCs",                        colour: "#b45309", companyIds: ["6981", "6762", "2327", "009150"] },
  server_odms:               { designation: "RACK",   name: "Server ODMs",                  colour: "#475569", companyIds: ["2317", "2382_TW", "3231"] },
};

/**
 * GET /api/agents/status
 * Returns status of all 17 sector agents including full thread_history for feed hydration.
 * ?sector_key=X — returns thread_history only for that sector (on-demand per sector).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const singleKey = searchParams.get("sector_key");

    const { getAllAgentThreads, getAgentThread, getCompanies, getAllLatestSyntheses } = await import("@/lib/db");

    let threads: Record<string, unknown>[] = [];
    let syntheses: Record<string, unknown>[] = [];
    let allCompanies: Record<string, unknown>[] = [];

    try {
      if (singleKey) {
        // On-demand: only fetch the one sector thread
        const thread = await getAgentThread(singleKey);
        threads = thread ? [thread] : [];
        [syntheses, allCompanies] = await Promise.all([
          getAllLatestSyntheses(),
          getCompanies(),
        ]);
      } else {
        [threads, syntheses, allCompanies] = await Promise.all([
          getAllAgentThreads(),
          getAllLatestSyntheses(),
          getCompanies(),
        ]);
      }
    } catch {
      allCompanies = [];
    }

    const threadMap: Record<string, Record<string, unknown>> = {};
    for (const t of threads) {
      threadMap[t.sector_key as string] = t;
    }

    const synthMap: Record<string, Record<string, unknown>> = {};
    for (const s of syntheses) {
      synthMap[s.sector_key as string] = s;
    }

    const companyMap: Record<string, Record<string, unknown>> = {};
    for (const c of allCompanies) {
      companyMap[c.id as string] = c;
    }

    const agentEntries = singleKey
      ? [[singleKey, AGENTS[singleKey]] as const].filter(([, v]) => v)
      : Object.entries(AGENTS);

    const agents = agentEntries.map(([key, agent]) => {
      const thread = threadMap[key];
      const synth = synthMap[key];
      const companies = agent.companyIds
        .map((id) => companyMap[id])
        .filter(Boolean)
        .map((c) => ({
          id: c.id,
          name: c.name,
          ticker: c.ticker_full,
          stance: c.investment_view || "neutral",
          conviction: c.conviction || "medium",
        }));

      const bullish = companies.filter((c) => c.stance === "bullish").length;
      const bearish = companies.filter((c) => c.stance === "bearish").length;

      const threadHistory = thread?.thread_history;
      const messageCount = Array.isArray(threadHistory) ? threadHistory.length : 0;

      // Compute unread count: messages with timestamp > last_read_at
      const lastReadAt = thread?.last_read_at ? new Date(thread.last_read_at as string).getTime() : 0;
      let unreadCount = 0;
      if (Array.isArray(threadHistory)) {
        for (const msg of threadHistory as Array<{ timestamp?: string }>) {
          if (msg.timestamp && new Date(msg.timestamp).getTime() > lastReadAt) {
            unreadCount++;
          }
        }
      }

      return {
        sector_key: key,
        designation: agent.designation,
        name: agent.name,
        colour: agent.colour,
        company_count: companies.length,
        bullish,
        neutral: companies.length - bullish - bearish,
        bearish,
        message_count: messageCount,
        unread_count: unreadCount,
        last_sweep_at: thread?.last_sweep_at || null,
        last_updated: thread?.last_updated || null,
        last_read_at: thread?.last_read_at || null,
        posture: (synth?.posture as string) || null,
        conviction: (synth?.conviction as number) || null,
        companies,
        // Return full thread_history for feed hydration
        thread_history: Array.isArray(threadHistory) ? threadHistory : [],
      };
    });

    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
