import { NextResponse } from "next/server";
import { runSweep, runSweepBatch } from "@/lib/sweep/executor";

export const maxDuration = 300; // 5 minutes per batch

/**
 * Batch definitions — 23 companies split into 6 batches of ~4 each.
 * Cron schedule: every 10 mins from 21:00–21:50 UTC (6:00–6:50 AM JST).
 *
 * Batch 1 (21:00): Accton, Advantest, Delta, Disco
 * Batch 2 (21:10): Eoptolink, Fabrinet, GDS, Hanwha
 * Batch 3 (21:20): Hitachi, Hon Hai, Isu Petasys, Lasertec
 * Batch 4 (21:30): Lite-on, Mediatek, Nanya, Panasonic
 * Batch 5 (21:40): Rorze, Samsung, Screen, SK Hynix
 * Batch 6 (21:50): Tokyo Electron, TSMC, Zhongji Innolight
 */
const BATCHES: Record<string, string[]> = {
  "1": ["2345", "6857", "2308", "6146"],
  "2": ["300502", "FN", "9698", "012450"],
  "3": ["6501", "2317", "007660", "6920"],
  "4": ["2301", "2454", "2408", "6752"],
  "5": ["6323", "005930", "7735", "000660"],
  "6": ["8035", "2330", "300308"],
};

/**
 * POST /api/sweep/run
 * Triggers a sweep. Supports three modes:
 *   - ?batch=N       — run a specific batch (used by cron)
 *   - ?companyId=X   — run a single company (used by manual sweep button)
 *   - no params      — run all companies sequentially (legacy, may timeout)
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || undefined;
    const batch = searchParams.get("batch") || undefined;

    // Single company sweep (manual trigger)
    if (companyId) {
      const results = await runSweep(companyId);
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        mode: "single",
        results,
      });
    }

    // Batch sweep (cron trigger)
    if (batch && BATCHES[batch]) {
      const companyIds = BATCHES[batch];
      const results = await runSweepBatch(companyIds);
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        mode: "batch",
        batch: parseInt(batch),
        companiesInBatch: companyIds.length,
        results,
      });
    }

    // No params — sweep all (may timeout with 23 companies)
    const results = await runSweep();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mode: "all",
      results,
    });
  } catch (error) {
    console.error("Sweep run error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Vercel Cron uses GET by default
export async function GET(request: Request) {
  return POST(request);
}
