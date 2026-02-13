import { NextResponse } from "next/server";
import { getSectors } from "@/lib/sector-config";

export const dynamic = "force-dynamic";

/**
 * GET /api/sectors
 * Returns sector definitions with live company data (stance counts, last material date).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectorName = searchParams.get("sector");
    const sectors = getSectors();

    const { getCompanies } = await import("@/lib/db");
    const { getAllSectorViews, getSectorLog } = await import("@/lib/db");
    const allCompanies = await getCompanies();
    const allViews = await getAllSectorViews();

    const viewMap: Record<string, Record<string, unknown>> = {};
    for (const v of allViews) {
      viewMap[v.sector_name as string] = v;
    }

    const companyMap: Record<string, Record<string, unknown>> = {};
    for (const c of allCompanies) {
      companyMap[c.id as string] = c;
    }

    const sectorsToReturn = sectorName
      ? sectors.filter((s) => s.name === sectorName)
      : sectors;

    const results = await Promise.all(
      sectorsToReturn.map(async (sector) => {
        const companies = sector.companyIds
          .map((id) => companyMap[id])
          .filter(Boolean)
          .map((c) => ({
            id: c.id,
            name: c.name,
            ticker: c.ticker_full,
            stance: c.investment_view || "neutral",
            conviction: c.conviction || "medium",
            lastMaterialAt: c.last_material_at || null,
          }));

        const bullish = companies.filter((c) => c.stance === "bullish").length;
        const bearish = companies.filter((c) => c.stance === "bearish").length;
        const neutral = companies.length - bullish - bearish;

        const materialDates = companies
          .filter((c) => c.lastMaterialAt)
          .map((c) => new Date(c.lastMaterialAt as string).getTime());
        const lastMaterialDate = materialDates.length > 0
          ? new Date(Math.max(...materialDates)).toISOString()
          : null;

        const sectorView = viewMap[sector.name] || null;

        let log: Record<string, unknown>[] = [];
        if (sectorName === sector.name) {
          try {
            log = await getSectorLog(sector.name, 50);
          } catch {
            log = [];
          }
        }

        return {
          name: sector.name,
          label: sector.label,
          companyCount: companies.length,
          bullish,
          neutral,
          bearish,
          lastMaterialDate,
          sectorView: sectorView
            ? {
                stance: sectorView.stance,
                conviction: sectorView.conviction,
                thesisSummary: sectorView.thesis_summary,
                valuationAssessment: sectorView.valuation_assessment,
                convictionRationale: sectorView.conviction_rationale,
                keyDrivers: sectorView.key_drivers,
                keyRisks: sectorView.key_risks,
                lastUpdated: sectorView.last_updated,
                lastUpdatedReason: sectorView.last_updated_reason,
              }
            : null,
          companies,
          log: log.map((l) => ({
            id: l.id,
            logDate: l.log_date,
            classification: l.classification,
            summary: l.summary,
            relatedCompanies: l.related_companies,
            createdAt: l.created_at,
          })),
        };
      })
    );

    return NextResponse.json({ sectors: results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
