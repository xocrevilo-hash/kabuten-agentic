import { NextResponse } from "next/server";

/**
 * GET /api/heatmap/results
 *
 * Primary source: heatmap_results table (written by /api/heatmap/sweep cron).
 * Fallback:       heatmap_snapshots table (written by Chrome MCP manual scans).
 *
 * Returns KeywordData[] with colour_hex precomputed by the sweep, plus metadata.
 */
export async function GET() {
  try {
    const { initializeDatabase, getLatestHeatmapResults, getHeatmapResults } = await import("@/lib/db");
    await initializeDatabase();

    // ── Try primary: heatmap_results (cron-swept) ──
    const cronRows = await getLatestHeatmapResults();

    if (cronRows.length > 0) {
      // Neon returns TIMESTAMPTZ as Date objects — convert safely
      const toIso = (v: unknown): string => (v instanceof Date ? v.toISOString() : String(v));

      // Compute swept_at from the most recently swept row
      const latestSweptAt = cronRows.reduce((latest, r) => {
        const t = new Date(toIso(r.swept_at)).getTime();
        return t > latest ? t : latest;
      }, 0);

      const keywords = cronRows.map((r) => ({
        keyword: r.keyword as string,
        category: (r.category || "uncategorized") as string,
        heatScore: Number(r.score),
        colourHex: (r.colour_hex || "#d1d5db") as string,
        totalViews: (r.volume || 0) as number,
        top3Views: [],
        sevenDayAvg: 0,
        trend: Number(r.score) >= 55 ? "heating" : Number(r.score) <= 45 ? "cooling" : "steady",
        delta: 0,
        scanDate: toIso(r.swept_at).split("T")[0],
        source: (r.source || "claude_websearch") as string,
      }));

      return NextResponse.json({
        keywords,
        lastScan: new Date(latestSweptAt).toISOString(),
        totalDays: 1,
        isBaseline: false,
        source: "heatmap_results",
      });
    }

    // ── Fallback: heatmap_snapshots (Chrome MCP) ──
    const fallback = await getHeatmapResults();
    return NextResponse.json({ ...fallback, source: "heatmap_snapshots" });
  } catch (error) {
    console.error("[Heatmap Results] Error:", error);
    return NextResponse.json(
      { keywords: [], lastScan: null, totalDays: 0, isBaseline: true },
      { status: 500 }
    );
  }
}
