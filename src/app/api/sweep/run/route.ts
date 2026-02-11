import { NextResponse } from "next/server";
import { runSweep, runSweepBatch } from "@/lib/sweep/executor";
import { getCompanies } from "@/lib/db";

export const maxDuration = 300; // 5 minutes per batch

const BATCH_SIZE = 8; // Max companies per batch (~30s each = ~4 min)

/**
 * Dynamic batching — companies are loaded from the DB, sorted by ID,
 * and sliced into groups of BATCH_SIZE. No hardcoded company lists.
 *
 * Cron triggers ?batch=1, ?batch=2, ... etc.
 * Each batch sweeps up to 8 companies within the 5-min timeout.
 *
 * 230 companies = 29 batches × 10 min spacing = 2:00–6:50 AM JST
 */
async function getCompanyBatch(batchNum: number): Promise<{ ids: string[]; totalBatches: number; totalCompanies: number }> {
  const companies = await getCompanies();
  // Sort deterministically by ID so batches are stable
  const sorted = companies.sort((a, b) => a.id.localeCompare(b.id));
  const totalCompanies = sorted.length;
  const totalBatches = Math.ceil(totalCompanies / BATCH_SIZE);

  const start = (batchNum - 1) * BATCH_SIZE;
  const end = Math.min(start + BATCH_SIZE, totalCompanies);
  const ids = sorted.slice(start, end).map((c) => c.id);

  return { ids, totalBatches, totalCompanies };
}

/**
 * POST /api/sweep/run
 * Triggers a sweep. Supports three modes:
 *   - ?batch=N       — run batch N from DB (used by cron)
 *   - ?companyId=X   — run a single company (used by manual sweep button)
 *   - no params      — run all companies sequentially (will timeout at scale)
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
    if (batch) {
      const batchNum = parseInt(batch);
      if (isNaN(batchNum) || batchNum < 1) {
        return NextResponse.json({ error: "Invalid batch number" }, { status: 400 });
      }

      const { ids, totalBatches, totalCompanies } = await getCompanyBatch(batchNum);

      if (ids.length === 0) {
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          mode: "batch",
          batch: batchNum,
          totalBatches,
          totalCompanies,
          message: `Batch ${batchNum} is empty — only ${totalBatches} batches needed for ${totalCompanies} companies`,
          results: [],
        });
      }

      const results = await runSweepBatch(ids);
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        mode: "batch",
        batch: batchNum,
        totalBatches,
        totalCompanies,
        batchSize: ids.length,
        results,
      });
    }

    // No params — sweep all (will timeout at scale, use batches instead)
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
