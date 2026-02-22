import { NextResponse } from "next/server";
import { getSectors } from "@/lib/sector-config";

export const maxDuration = 300;

/**
 * POST /api/sectors/sweep
 * Runs the sector synthesis agent for all sectors (or a specific one).
 * Collects today's sweep results from individual companies and synthesises sector views.
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectorName = searchParams.get("sector");

    const {
      getCompanies,
      getSectorView,
      upsertSectorView,
      insertSectorLog,
      getTodaySweepResultsForCompanies,
    } = await import("@/lib/db");
    const { synthesizeSectorView } = await import("@/lib/claude");

    const sectors = sectorName
      ? getSectors().filter((s) => s.name === sectorName)
      : getSectors();

    const allCompanies = await getCompanies();
    const companyMap: Record<string, Record<string, unknown>> = {};
    for (const c of allCompanies) {
      companyMap[c.id as string] = c;
    }

    const results: { sector: string; classification: string; summary: string }[] = [];

    for (const sector of sectors) {
      try {
        // Get company data for this sector
        const sectorCompanies = sector.companyIds
          .map((id) => companyMap[id])
          .filter(Boolean)
          .map((c) => ({
            name: c.name as string,
            ticker: c.ticker_full as string,
            stance: (c.investment_view as string) || "neutral",
            conviction: (c.conviction as string) || "medium",
          }));

        // Get today's sweep results
        const existingCompanyIds = sector.companyIds.filter((id) => companyMap[id]);
        const todayResults = await getTodaySweepResultsForCompanies(existingCompanyIds);

        const sweepResults = todayResults.map((r: Record<string, unknown>) => ({
          company_name: r.company_name as string,
          severity: r.severity as string,
          summary: r.summary as string,
        }));

        // Get current sector view
        const currentView = await getSectorView(sector.name);

        // INITIAL GENERATION: If no sector view exists, generate from member company profiles
        if (!currentView) {
          const { generateInitialSectorView } = await import("@/lib/claude");

          const companyProfiles = sector.companyIds
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

          try {
            const initialView = await generateInitialSectorView({
              sectorName: sector.label,
              companies: companyProfiles,
            });

            await upsertSectorView({
              sectorName: sector.name,
              stance: initialView.stance || "neutral",
              conviction: initialView.conviction || "medium",
              thesisSummary: initialView.thesis_summary || "",
              valuationAssessment: initialView.valuation_assessment || [],
              convictionRationale: initialView.conviction_rationale || [],
              keyDrivers: initialView.key_drivers || [],
              keyRisks: initialView.key_risks || [],
              lastUpdatedReason: "Initial sector view generated",
            });

            await insertSectorLog({
              sectorName: sector.name,
              classification: "MATERIAL",
              summary: `Initial sector view generated for ${sector.label}`,
              relatedCompanies: companyProfiles.map((c) => c.name),
              detailJson: null,
            });

            results.push({
              sector: sector.name,
              classification: "MATERIAL",
              summary: `Initial sector view generated for ${sector.label}`,
            });

            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          } catch (err) {
            console.error(`Failed to generate initial view for ${sector.name}:`, err);
            // Fall through to normal synthesis
          }
        }

        // Normal sector synthesis with today's sweep results
        const synthesis = await synthesizeSectorView({
          sectorName: sector.label,
          companies: sectorCompanies,
          currentSectorView: currentView
            ? {
                stance: currentView.stance as string,
                conviction: currentView.conviction as string,
                thesis_summary: currentView.thesis_summary as string,
                valuation_assessment: currentView.valuation_assessment as string[],
                conviction_rationale: currentView.conviction_rationale as string[],
              }
            : null,
          todaySweepResults: sweepResults,
        });

        // Log the result
        const relatedCompanies = sweepResults
          .filter((r: { severity: string }) => r.severity !== "no_change")
          .map((r: { company_name: string }) => r.company_name);

        await insertSectorLog({
          sectorName: sector.name,
          classification: synthesis.classification,
          summary: synthesis.summary,
          relatedCompanies,
          detailJson: synthesis.detail,
        });

        // Update sector view if material
        if (synthesis.classification === "MATERIAL" && synthesis.suggested_sector_view_update) {
          const update = synthesis.suggested_sector_view_update;
          await upsertSectorView({
            sectorName: sector.name,
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

        results.push({
          sector: sector.name,
          classification: synthesis.classification,
          summary: synthesis.summary,
        });

        // Delay between sectors for rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        results.push({
          sector: sector.name,
          classification: "ERROR",
          summary: error instanceof Error ? error.message : String(error),
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

// Vercel Cron uses GET by default
export async function GET(request: Request) {
  return POST(request);
}
