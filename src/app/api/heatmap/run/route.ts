import { NextResponse } from "next/server";

/**
 * POST /api/heatmap/run
 * Legacy endpoint — the heatmap scan is now driven by Chrome MCP
 * through individual POST /api/heatmap/record calls per keyword.
 *
 * This endpoint now serves as a batch reset/initialization trigger.
 * It creates empty records for all keywords on today's date.
 */
export async function POST() {
  try {
    const { initializeDatabase, recordHeatmapKeyword } = await import("@/lib/db");
    await initializeDatabase();

    // The heatmap keywords with categories
    const KEYWORDS = [
      { keyword: "HBM", category: "AI & ML" },
      { keyword: "AI agents", category: "AI & ML" },
      { keyword: "inference", category: "AI & ML" },
      { keyword: "LLM", category: "AI & ML" },
      { keyword: "AI training", category: "AI & ML" },
      { keyword: "edge AI", category: "AI & ML" },
      { keyword: "autonomous driving", category: "AI & ML" },
      { keyword: "robotics", category: "AI & ML" },
      { keyword: "quantum computing", category: "AI & ML" },
      { keyword: "TSMC", category: "Semiconductors" },
      { keyword: "Nvidia", category: "Semiconductors" },
      { keyword: "semiconductor", category: "Semiconductors" },
      { keyword: "CoWoS", category: "Semiconductors" },
      { keyword: "advanced packaging", category: "Semiconductors" },
      { keyword: "EUV", category: "Semiconductors" },
      { keyword: "foundry", category: "Semiconductors" },
      { keyword: "GPU", category: "Semiconductors" },
      { keyword: "DRAM", category: "Semiconductors" },
      { keyword: "NAND", category: "Semiconductors" },
      { keyword: "custom ASIC", category: "Semiconductors" },
      { keyword: "silicon photonics", category: "Semiconductors" },
      { keyword: "Intel", category: "Semiconductors" },
      { keyword: "AMD", category: "Semiconductors" },
      { keyword: "SK Hynix", category: "Semiconductors" },
      { keyword: "ASML", category: "Semiconductors" },
      { keyword: "data center", category: "Cloud & Data" },
      { keyword: "cloud capex", category: "Cloud & Data" },
      { keyword: "AI server", category: "Cloud & Data" },
      { keyword: "networking", category: "Cloud & Data" },
      { keyword: "optical transceiver", category: "Cloud & Data" },
      { keyword: "Broadcom", category: "Cloud & Data" },
      { keyword: "Samsung", category: "Cloud & Data" },
      { keyword: "power semiconductor", category: "Hardware" },
      { keyword: "nuclear power", category: "Hardware" },
      { keyword: "chip ban", category: "Regulation & Trade" },
      { keyword: "AI regulation", category: "Regulation & Trade" },
      { keyword: "China sanctions", category: "Regulation & Trade" },
      { keyword: "tariff", category: "Regulation & Trade" },
      { keyword: "energy transition", category: "Energy & Materials" },
      { keyword: "battery", category: "Energy & Materials" },
    ];

    let processed = 0;
    for (const kw of KEYWORDS) {
      await recordHeatmapKeyword({
        keyword: kw.keyword,
        category: kw.category,
        totalViews: 0,
        top3Views: [],
      });
      processed++;
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${processed} keywords for today's heatmap. Use Chrome MCP to populate view counts.`,
      keywords: processed,
    });
  } catch (error) {
    console.error("[Heatmap Run] Error:", error);
    return NextResponse.json(
      { success: false, message: `Heatmap initialization failed: ${String(error)}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
