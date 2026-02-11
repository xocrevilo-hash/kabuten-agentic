import { NextResponse } from "next/server";

/**
 * GET /api/heatmap
 * Returns latest heatmap data. Delegates to getHeatmapResults for score computation.
 */
export async function GET() {
  try {
    const { initializeDatabase, getHeatmapResults } = await import("@/lib/db");
    await initializeDatabase();

    const results = await getHeatmapResults();

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ keywords: [], lastScan: null, totalDays: 0, isBaseline: true });
  }
}
