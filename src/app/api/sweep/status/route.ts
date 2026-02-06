import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * GET /api/sweep/status
 * Returns the status of the latest sweep for each company.
 */
export async function GET() {
  try {
    const sql = getDb();

    // Get the latest action log entry per company
    const latestSweeps = await sql`
      SELECT DISTINCT ON (c.id)
        c.id,
        c.name,
        c.ticker_full,
        c.investment_view,
        c.conviction,
        c.last_sweep_at,
        c.last_material_at,
        al.severity as last_severity,
        al.summary as last_summary,
        al.timestamp as last_log_time
      FROM companies c
      LEFT JOIN action_log al ON c.id = al.company_id
      ORDER BY c.id, al.timestamp DESC
    `;

    // Get sweep counts per company
    const sweepCounts = await sql`
      SELECT
        company_id,
        COUNT(*) as total_sweeps,
        COUNT(CASE WHEN severity = 'material' THEN 1 END) as material_count,
        COUNT(CASE WHEN severity = 'notable' THEN 1 END) as notable_count
      FROM action_log
      GROUP BY company_id
    `;

    const countsMap = Object.fromEntries(
      sweepCounts.map((row) => [
        row.company_id,
        {
          total: Number(row.total_sweeps),
          material: Number(row.material_count),
          notable: Number(row.notable_count),
        },
      ])
    );

    const status = latestSweeps.map((row) => ({
      companyId: row.id,
      companyName: row.name,
      ticker: row.ticker_full,
      investmentView: row.investment_view,
      conviction: row.conviction,
      lastSweepAt: row.last_sweep_at,
      lastMaterialAt: row.last_material_at,
      lastSeverity: row.last_severity,
      lastSummary: row.last_summary,
      counts: countsMap[row.id] || { total: 0, material: 0, notable: 0 },
    }));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      companies: status,
    });
  } catch (error) {
    console.error("Sweep status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
