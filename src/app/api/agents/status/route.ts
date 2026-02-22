import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Agent definitions — matches agents/config.py.
 * sector_key → { designation, name, colour, companyIds }
 */
const AGENTS: Record<string, { designation: string; name: string; colour: string; companyIds: string[] }> = {
  au_enterprise_software:    { designation: "APEX",   name: "AU Enterprise Software",    colour: "#6366f1", companyIds: ["WTC", "XRO", "PME", "REA", "SEK"] },
  china_digital_consumption: { designation: "ORIENT", name: "China Digital Consumption",  colour: "#f59e0b", companyIds: ["9988", "BIDU", "NTES", "0700", "TME", "TCOM"] },
  dc_power_cooling:          { designation: "VOLT",   name: "DC Power & Cooling",         colour: "#ef4444", companyIds: ["3324", "2308", "6501", "VST"] },
  india_it_services:         { designation: "INDRA",  name: "India IT Services",           colour: "#10b981", companyIds: ["INFY", "TCS", "TECHM", "WIPRO"] },
  memory_semis:              { designation: "HELIX",  name: "Memory Semis",                colour: "#8b5cf6", companyIds: ["285A", "MU", "005930", "SNDK", "STX", "000660"] },
  networking_optics:         { designation: "PHOTON", name: "Networking & Optics",          colour: "#06b6d4", companyIds: ["2345", "CLS", "COHR", "FN", "LITE", "300394", "300308"] },
  semi_equipment:            { designation: "FORGE",  name: "Semi Equipment",               colour: "#ec4899", companyIds: ["688082", "6857", "AMAT", "3711", "ASML", "6146", "6361", "7741", "KLAC", "6525", "LRCX", "6920", "6323", "7735", "8035", "7729"] },
};

/**
 * GET /api/agents/status
 * Returns status of all 7 sector agents with thread length, last sweep, and company data.
 */
export async function GET() {
  try {
    const { getAllAgentThreads, getCompanies, getAllLatestSyntheses } = await import("@/lib/db");

    let threads: Record<string, unknown>[] = [];
    let syntheses: Record<string, unknown>[] = [];
    let allCompanies: Record<string, unknown>[] = [];

    try {
      [threads, syntheses, allCompanies] = await Promise.all([
        getAllAgentThreads(),
        getAllLatestSyntheses(),
        getCompanies(),
      ]);
    } catch {
      // Tables may not exist yet — return defaults
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

    const agents = Object.entries(AGENTS).map(([key, agent]) => {
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
        last_sweep_at: thread?.last_sweep_at || null,
        last_updated: thread?.last_updated || null,
        posture: (synth?.posture as string) || null,
        conviction: (synth?.conviction as number) || null,
        companies,
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
