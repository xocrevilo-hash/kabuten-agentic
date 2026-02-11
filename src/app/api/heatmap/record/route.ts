import { NextResponse } from "next/server";

/**
 * POST /api/heatmap/record
 * Receives individual keyword scan results from Chrome MCP and stores in DB.
 * Called once per keyword during the heatmap scan sequence.
 *
 * Body: { keyword: string, totalViews: number, top3Views: number[], category?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, totalViews, top3Views, category } = body;

    if (!keyword || totalViews === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: keyword, totalViews" },
        { status: 400 }
      );
    }

    const { initializeDatabase, recordHeatmapKeyword } = await import("@/lib/db");
    await initializeDatabase();

    const result = await recordHeatmapKeyword({
      keyword,
      category: category || "uncategorized",
      totalViews: Number(totalViews),
      top3Views: Array.isArray(top3Views) ? top3Views.map(Number) : [],
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Heatmap Record] Error:", error);
    return NextResponse.json(
      { error: `Failed to record heatmap data: ${String(error)}` },
      { status: 500 }
    );
  }
}
