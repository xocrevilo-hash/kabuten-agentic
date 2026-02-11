import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { initializeDatabase, getPortfolioHoldings, getPortfolioSnapshots, getPortfolioChanges } = await import("@/lib/db");
    await initializeDatabase();

    const holdings = await getPortfolioHoldings(true);
    const snapshots = await getPortfolioSnapshots(30);
    const changes = await getPortfolioChanges(50);

    // Compute returns from snapshots
    const latestNav = snapshots.length > 0 ? (snapshots[0].nav as number) : 100.0;
    const getNavAt = (daysAgo: number): number | null => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - daysAgo);
      const snap = snapshots.find((s: Record<string, unknown>) => {
        const d = new Date(s.snapshot_date as string);
        return d <= targetDate;
      });
      return snap ? (snap.nav as number) : null;
    };

    const computeReturn = (pastNav: number | null): number | null => {
      if (pastNav === null || pastNav === 0) return null;
      return ((latestNav / pastNav) - 1) * 100;
    };

    const returns = {
      "1D": computeReturn(getNavAt(1)),
      "1W": computeReturn(getNavAt(7)),
      "1M": computeReturn(getNavAt(30)),
      "3M": computeReturn(getNavAt(90)),
      "1Y": computeReturn(getNavAt(365)),
      "3Y": computeReturn(getNavAt(1095)),
      "5Y": computeReturn(getNavAt(1825)),
      inception: computeReturn(100.0), // Starting NAV is always 100
    };

    // Get latest Kabuten View
    const kabutenView = snapshots.length > 0 && snapshots[0].kabuten_view
      ? (snapshots[0].kabuten_view as string)
      : "Portfolio will be initialized on 9 Feb 2026 with the top 20 highest conviction ideas from all covered companies. Returns are USD-denominated, equal-weighted at entry with no rebalancing.";

    return NextResponse.json({
      holdings: holdings.map((h: Record<string, unknown>) => ({
        company_id: h.company_id,
        company_name: h.company_name,
        ticker_full: h.ticker_full,
        conviction: h.conviction,
        weight: h.initial_weight || 0.05,
        entry_date: h.entry_date,
        return_pct: h.entry_price_usd && (h.entry_price_usd as number) > 0
          ? 0 // Placeholder — real returns need live price data
          : 0,
      })),
      returns,
      kabutenView,
      changeLog: changes.map((c: Record<string, unknown>) => ({
        date: c.change_date,
        action: c.action,
        detail: `${c.company_name} (${c.ticker_full}) — ${c.reason}`,
      })),
    });
  } catch {
    return NextResponse.json({
      holdings: [],
      returns: { "1D": null, "1W": null, "1M": null, "3M": null, "1Y": null, "3Y": null, "5Y": null, inception: null },
      kabutenView: "Portfolio will be initialized on 9 Feb 2026 with the top 20 highest conviction ideas from all covered companies. Returns are USD-denominated, equal-weighted at entry with no rebalancing.",
      changeLog: [],
    });
  }
}
