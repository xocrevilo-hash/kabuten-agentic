import { NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * GET /api/portfolio/rebalance
 * Cron trigger: checks if any agent views have changed,
 * and rebalances the portfolio accordingly.
 *
 * Logic:
 * 1. Load current portfolio holdings
 * 2. Query all companies for latest investment_view + conviction
 * 3. Identify top 20 bullish + highest conviction candidates
 * 4. Compare with current holdings
 * 5. If changes needed: log change, update holdings
 */
export async function GET() {
  try {
    const {
      initializeDatabase,
      getPortfolioHoldings,
      insertPortfolioHolding,
      insertPortfolioChange,
    } = await import("@/lib/db");
    const { getDb } = await import("@/lib/db");
    await initializeDatabase();

    const sql = getDb();

    // Get current active holdings
    const currentHoldings = await getPortfolioHoldings(true);
    const currentHoldingIds = new Set(
      currentHoldings.map((h: Record<string, unknown>) => h.company_id as string)
    );

    // Get all companies ranked by conviction (bullish only)
    const candidates = await sql`
      SELECT id, name, ticker_full, investment_view, conviction, country, exchange
      FROM companies
      WHERE investment_view = 'bullish'
      ORDER BY
        CASE conviction
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
          ELSE 4
        END ASC,
        updated_at DESC
      LIMIT 30
    `;

    // Top 20 candidates by conviction
    const top20Ids = new Set(
      candidates.slice(0, 20).map((c: Record<string, unknown>) => c.id as string)
    );

    const changes: { action: string; companyId: string; companyName: string; ticker: string; reason: string }[] = [];

    // Check for removals: current holdings not in top 20
    for (const h of currentHoldings) {
      const holding = h as Record<string, unknown>;
      const companyId = holding.company_id as string;
      if (!top20Ids.has(companyId)) {
        // This holding should be removed
        const company = candidates.find((c: Record<string, unknown>) => c.id === companyId);
        const reason = company
          ? `Dropped from top 20: view=${company.investment_view}, conviction=${company.conviction}`
          : "No longer bullish or dropped below conviction threshold";

        // Mark holding as inactive
        await sql`
          UPDATE portfolio_holdings
          SET is_active = false, exit_date = CURRENT_DATE, exit_reason = ${reason}
          WHERE company_id = ${companyId} AND is_active = true
        `;

        await insertPortfolioChange({
          changeDate: new Date().toISOString().split("T")[0],
          action: "REMOVE",
          companyId,
          reason,
          priceLocal: null,
          priceUsd: null,
          weight: (holding.initial_weight as number) || 0.05,
        });

        changes.push({
          action: "REMOVE",
          companyId,
          companyName: holding.company_name as string,
          ticker: holding.ticker_full as string,
          reason,
        });
      }
    }

    // Check for additions: top 20 candidates not in current holdings
    for (const c of candidates.slice(0, 20)) {
      const candidate = c as Record<string, unknown>;
      const companyId = candidate.id as string;
      if (!currentHoldingIds.has(companyId)) {
        // This should be added
        const reason = `Added to portfolio: view=${candidate.investment_view}, conviction=${candidate.conviction}`;

        await insertPortfolioHolding({
          companyId,
          entryDate: new Date().toISOString().split("T")[0],
          entryPriceLocal: null, // Will be filled by next snapshot
          entryFxRate: 1.0,
          entryPriceUsd: null,
          initialWeight: 0.05, // Equal weight
        });

        await insertPortfolioChange({
          changeDate: new Date().toISOString().split("T")[0],
          action: "ADD",
          companyId,
          reason,
          priceLocal: null,
          priceUsd: null,
          weight: 0.05,
        });

        changes.push({
          action: "ADD",
          companyId,
          companyName: candidate.name as string,
          ticker: candidate.ticker_full as string,
          reason,
        });
      }
    }

    const message = changes.length > 0
      ? `Portfolio rebalanced: ${changes.filter((c) => c.action === "ADD").length} additions, ${changes.filter((c) => c.action === "REMOVE").length} removals.`
      : "Portfolio rebalancing check complete. No changes needed.";

    return NextResponse.json({
      success: true,
      message,
      changes: changes.map((c) => ({
        action: c.action,
        detail: `${c.companyName} (${c.ticker}) — ${c.reason}`,
      })),
    });
  } catch (error) {
    console.error("Portfolio rebalance error:", error);
    return NextResponse.json(
      { success: false, message: "Portfolio rebalance failed: " + String(error), changes: [] },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST() {
  return GET();
}
