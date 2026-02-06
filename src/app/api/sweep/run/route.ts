import { NextResponse } from "next/server";
import { runSweep } from "@/lib/sweep/executor";

export const maxDuration = 300; // 5 minutes — sweeps can be long

/**
 * POST /api/sweep/run
 * Triggers a sweep for all companies or a specific one.
 * Called by: Vercel Cron (daily at 5:00 AM JST) or manual trigger.
 *
 * Query params:
 *   companyId — optional, run sweep for specific company only
 *
 * Headers:
 *   Authorization: Bearer <CRON_SECRET> — required for cron, optional for manual
 */
export async function POST(request: Request) {
  // Verify cron secret if present (Vercel sends this header for cron jobs)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // For cron jobs, Vercel sends Authorization: Bearer <CRON_SECRET>
  if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || undefined;

    const results = await runSweep(companyId);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
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

// Also support GET for Vercel Cron (cron jobs use GET by default)
export async function GET(request: Request) {
  return POST(request);
}
