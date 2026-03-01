import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Agent definitions — matches agents/config.py.
 * All 17 sectors.
 */
const AGENTS: Record<string, { designation: string; name: string; companyIds: string[] }> = {
  au_enterprise_software:    { designation: "APEX",   name: "AU Enterprise Software",    companyIds: ["WTC", "XRO", "PME", "REA", "SEK"] },
  china_digital_consumption: { designation: "ORIENT", name: "China Digital Consumption",  companyIds: ["9988", "BIDU", "NTES", "0700", "TME", "TCOM", "PDD"] },
  dc_power_cooling:          { designation: "VOLT",   name: "DC Power & Cooling",         companyIds: ["3324", "2308", "6501", "VRT", "2301"] },
  india_it_services:         { designation: "INDRA",  name: "India IT Services",           companyIds: ["INFY", "TCS", "TECHM", "WIPRO"] },
  memory_semis:              { designation: "HELIX",  name: "Memory Semis",                companyIds: ["285A", "MU", "005930", "SNDK", "STX", "000660", "2408"] },
  networking_optics:         { designation: "PHOTON", name: "Networking & Optics",          companyIds: ["2345", "CLS", "COHR", "FN", "LITE", "300394", "300308", "300502"] },
  semi_equipment:            { designation: "FORGE",  name: "Semi Equipment",               companyIds: ["688082", "6857", "AMAT", "3711", "ASML", "6146", "6361", "7741", "KLAC", "6525", "LRCX", "6920", "6323", "7735", "8035", "7729", "002371"] },
  ev_supply_chain:           { designation: "SURGE",  name: "EV Supply-chain",              companyIds: ["TSLA", "1211", "300750", "1810", "373220"] },
  china_ai_apps:             { designation: "SYNTH",  name: "China AI Apps",                companyIds: ["0100", "2513"] },
  china_semis:               { designation: "DRAGON", name: "China Semis",                  companyIds: ["688981", "688256", "688041", "603501", "688008"] },
  japan_materials:           { designation: "TERRA",  name: "Japan Materials",              companyIds: ["4004", "3110", "3436", "5016", "4062"] },
  gaming:                    { designation: "PIXEL",  name: "Gaming",                       companyIds: ["7974", "6758", "9697", "EA", "TTWO"] },
  pcb_supply_chain:          { designation: "LAYER",  name: "PCB Supply-chain",             companyIds: ["007660", "2368", "3037", "1303"] },
  asean_ecommerce:           { designation: "TIDE",   name: "ASEAN E-commerce",             companyIds: ["GRAB", "SE"] },
  ai_semis:                  { designation: "NOVA",   name: "AI Semis",                     companyIds: ["2330", "NVDA", "AVGO", "AMD", "2454", "MRVL"] },
  mlccs:                     { designation: "FERRO",  name: "MLCCs",                        companyIds: ["6981", "6762", "2327", "009150"] },
  server_odms:               { designation: "RACK",   name: "Server ODMs",                  companyIds: ["2317", "2382_TW", "3231"] },
};

/**
 * POST /api/agents/sweep
 * Runs the multi-agent sector sweep for one or all sectors.
 * Body: { sector_key?: string } — omit to sweep all 17.
 */
export async function POST(request: Request) {
  try {
    let sectorKey: string | null = null;
    try {
      const body = await request.json();
      sectorKey = body?.sector_key || null;
    } catch {
      // No body — sweep all
    }

    const {
      getCompanies,
      getTodaySweepResultsForCompanies,
      getAgentThread,
      saveAgentThread,
      updateAgentSweepTime,
      insertSynthesis,
      upsertSectorView,
      insertSectorLog,
      getSectorView,
    } = await import("@/lib/db");
    const { synthesizeSectorView, generateInitialSectorView } = await import("@/lib/claude");

    const allCompanies = await getCompanies();
    const companyMap: Record<string, Record<string, unknown>> = {};
    for (const c of allCompanies) {
      companyMap[c.id as string] = c;
    }

    const sectorsToSweep = sectorKey
      ? { [sectorKey]: AGENTS[sectorKey] }
      : AGENTS;

    const results: { sector_key: string; designation: string; posture: string; conviction: number; summary: string }[] = [];

    for (const [key, agent] of Object.entries(sectorsToSweep)) {
      if (!agent) continue;

      try {
        // Get company data for this sector
        const sectorCompanies = agent.companyIds
          .map((id) => companyMap[id])
          .filter(Boolean)
          .map((c) => ({
            name: c.name as string,
            ticker: c.ticker_full as string,
            stance: (c.investment_view as string) || "neutral",
            conviction: (c.conviction as string) || "medium",
            thesis: ((c.profile_json as Record<string, unknown>)?.investment_view_detail as Record<string, unknown>)?.thesis_summary as string ||
                    (c.profile_json as Record<string, unknown>)?.thesis as string || "",
          }));

        // Get today's sweep results for this sector's companies
        const existingCompanyIds = agent.companyIds.filter((id) => companyMap[id]);
        const todayResults = await getTodaySweepResultsForCompanies(existingCompanyIds);

        const sweepResults = todayResults.map((r: Record<string, unknown>) => ({
          company_name: r.company_name as string,
          severity: r.severity as string,
          summary: r.summary as string,
        }));

        // Check if sector view exists
        const currentView = await getSectorView(
          Object.entries({
            au_enterprise_software: "Australia Enterprise Software",
            china_digital_consumption: "China Digital Consumption",
            dc_power_cooling: "Data-centre Power & Cooling",
            india_it_services: "India IT Services",
            memory_semis: "Memory Semiconductors",
            networking_optics: "Networking & Optics",
            semi_equipment: "Semiconductor Production Equipment",
          }).find(([k]) => k === key)?.[1] || agent.name,
        );

        const sectorName = Object.entries({
          au_enterprise_software: "Australia Enterprise Software",
          china_digital_consumption: "China Digital Consumption",
          dc_power_cooling: "Data-centre Power & Cooling",
          india_it_services: "India IT Services",
          memory_semis: "Memory Semiconductors",
          networking_optics: "Networking & Optics",
          semi_equipment: "Semiconductor Production Equipment",
        }).find(([k]) => k === key)?.[1] || agent.name;

        let synthesis;

        if (!currentView) {
          // Initial generation
          const initialView = await generateInitialSectorView({
            sectorName: agent.name,
            companies: sectorCompanies,
          });

          await upsertSectorView({
            sectorName,
            stance: initialView.stance || "neutral",
            conviction: initialView.conviction || "medium",
            thesisSummary: initialView.thesis_summary || "",
            valuationAssessment: initialView.valuation_assessment || [],
            convictionRationale: initialView.conviction_rationale || [],
            keyDrivers: initialView.key_drivers || [],
            keyRisks: initialView.key_risks || [],
            lastUpdatedReason: "Initial sector view generated by agent sweep",
          });

          synthesis = {
            classification: "MATERIAL",
            summary: `Initial sector view generated for ${agent.name}`,
            detail: null,
            suggested_sector_view_update: null,
          };
        } else {
          // Normal synthesis
          synthesis = await synthesizeSectorView({
            sectorName: agent.name,
            companies: sectorCompanies,
            currentSectorView: {
              stance: currentView.stance as string,
              conviction: currentView.conviction as string,
              thesis_summary: currentView.thesis_summary as string,
              valuation_assessment: currentView.valuation_assessment as string[],
              conviction_rationale: currentView.conviction_rationale as string[],
            },
            todaySweepResults: sweepResults,
          });

          if (synthesis.classification === "MATERIAL" && synthesis.suggested_sector_view_update) {
            const update = synthesis.suggested_sector_view_update;
            await upsertSectorView({
              sectorName,
              stance: update.stance || "neutral",
              conviction: update.conviction || "medium",
              thesisSummary: update.thesis_summary || "",
              valuationAssessment: update.valuation_assessment || [],
              convictionRationale: update.conviction_rationale || [],
              keyDrivers: update.key_drivers || [],
              keyRisks: update.key_risks || [],
              lastUpdatedReason: synthesis.summary,
            });
          }
        }

        // Log result
        const relatedCompanies = sweepResults
          .filter((r: { severity: string }) => r.severity !== "no_change")
          .map((r: { company_name: string }) => r.company_name);

        await insertSectorLog({
          sectorName,
          classification: synthesis.classification,
          summary: synthesis.summary,
          relatedCompanies,
          detailJson: synthesis.detail,
        });

        // Save synthesis to new table
        await insertSynthesis({
          sectorKey: key,
          designation: agent.designation,
          posture: synthesis.suggested_sector_view_update?.stance || currentView?.stance as string || "neutral",
          conviction: parseFloat(synthesis.suggested_sector_view_update?.conviction || currentView?.conviction as string || "5"),
          thesisSummary: synthesis.summary,
          keyDrivers: synthesis.suggested_sector_view_update?.key_drivers || [],
          keyRisks: synthesis.suggested_sector_view_update?.key_risks || [],
          companySignals: sweepResults,
          materialFindings: sweepResults.filter((r: { severity: string }) => r.severity === "material"),
        });

        // Update thread history
        const thread = await getAgentThread(key);
        const threadHistory = Array.isArray(thread?.thread_history) ? [...(thread.thread_history as unknown[])] : [];
        threadHistory.push({
          role: "system",
          type: "sweep",
          timestamp: new Date().toISOString(),
          classification: synthesis.classification,
          summary: synthesis.summary,
          company_results: sweepResults,
        });
        await saveAgentThread(key, threadHistory);
        await updateAgentSweepTime(key);

        results.push({
          sector_key: key,
          designation: agent.designation,
          posture: synthesis.suggested_sector_view_update?.stance || "neutral",
          conviction: parseFloat(synthesis.suggested_sector_view_update?.conviction || "5"),
          summary: synthesis.summary,
        });

        // Rate limit delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        results.push({
          sector_key: key,
          designation: agent.designation,
          posture: "neutral",
          conviction: 5,
          summary: `Error: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Vercel Cron uses GET
export async function GET(request: Request) {
  return POST(request);
}
