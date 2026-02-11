import { NextResponse } from "next/server";

/**
 * GET /api/heatmap/results
 * Returns all keywords with computed heat scores, deltas, and metadata.
 * Computes scores from stored data using 7-day rolling average comparison.
 */
export async function GET() {
  try {
    const { initializeDatabase, getHeatmapResults } = await import("@/lib/db");
    await initializeDatabase();

    const results = await getHeatmapResults();

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Heatmap Results] Error:", error);
    return NextResponse.json(
      { keywords: [], lastScan: null, totalDays: 0, isBaseline: true },
      { status: 500 }
    );
  }
}
