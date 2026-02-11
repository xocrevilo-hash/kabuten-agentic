import { NextResponse } from "next/server";

/**
 * GET /api/heatmap/status
 * Returns Chrome MCP connection status and scan progress info.
 * The actual connection check happens on the frontend via the MCP tools —
 * this endpoint provides server-side scan metadata.
 */
export async function GET() {
  try {
    const { initializeDatabase, getHeatmapDayCount, getHeatmapSnapshots } = await import("@/lib/db");
    await initializeDatabase();

    const dayCount = await getHeatmapDayCount();
    const latestSnapshots = await getHeatmapSnapshots();

    const lastScan = latestSnapshots.length > 0 ? latestSnapshots[0].created_at : null;
    const keywordCount = latestSnapshots.length;

    return NextResponse.json({
      totalDays: Number(dayCount),
      isBaseline: Number(dayCount) < 7,
      lastScan,
      keywordCount,
      daysUntilActive: Math.max(0, 7 - Number(dayCount)),
    });
  } catch (error) {
    console.error("[Heatmap Status] Error:", error);
    return NextResponse.json({
      totalDays: 0,
      isBaseline: true,
      lastScan: null,
      keywordCount: 0,
      daysUntilActive: 7,
    });
  }
}
