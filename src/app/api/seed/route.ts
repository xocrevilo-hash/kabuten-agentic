import { NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/lib/db";
import seedData from "../../../../data/seed.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = seedData as any;

export async function POST() {
  try {
    await initializeDatabase();
    const sql = getDb();

    let seeded = 0;
    for (const company of data.companies) {
      await sql`
        INSERT INTO companies (id, name, name_jp, ticker_full, exchange, country, classification, market_cap_usd, benchmark_index, sector, profile_json, sweep_criteria_json, investment_view, conviction)
        VALUES (
          ${company.id},
          ${company.name},
          ${company.name_jp},
          ${company.ticker_full},
          ${company.exchange || null},
          ${company.country || null},
          ${company.classification || null},
          ${company.market_cap_usd || null},
          ${company.benchmark_index || null},
          ${company.sector},
          ${JSON.stringify(company.profile_json)},
          ${JSON.stringify(company.sweep_criteria_json)},
          ${company.investment_view},
          ${company.conviction}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          name_jp = EXCLUDED.name_jp,
          ticker_full = EXCLUDED.ticker_full,
          exchange = EXCLUDED.exchange,
          country = EXCLUDED.country,
          classification = EXCLUDED.classification,
          market_cap_usd = EXCLUDED.market_cap_usd,
          benchmark_index = EXCLUDED.benchmark_index,
          sector = EXCLUDED.sector,
          profile_json = EXCLUDED.profile_json,
          sweep_criteria_json = EXCLUDED.sweep_criteria_json,
          investment_view = EXCLUDED.investment_view,
          conviction = EXCLUDED.conviction,
          updated_at = NOW()
      `;
      seeded++;
    }

    // Remove companies no longer in seed data (cascade to dependent tables)
    const seedIds = data.companies.map((c: { id: string }) => c.id);
    const staleCompanies = await sql`SELECT id FROM companies WHERE id != ALL(${seedIds})`;
    if (staleCompanies.length > 0) {
      const staleIds = staleCompanies.map((c: Record<string, unknown>) => c.id as string);
      await sql`DELETE FROM action_log WHERE company_id = ANY(${staleIds})`;
      await sql`DELETE FROM sweep_data WHERE company_id = ANY(${staleIds})`;
      await sql`DELETE FROM portfolio_holdings WHERE company_id = ANY(${staleIds})`;
      await sql`DELETE FROM portfolio_changes WHERE company_id = ANY(${staleIds})`;
      await sql`DELETE FROM companies WHERE id = ANY(${staleIds})`;
    }

    const actionLogs = data.action_log || [];
    for (const log of actionLogs) {
      await sql`
        INSERT INTO action_log (company_id, timestamp, severity, summary, detail_json, sources_checked)
        VALUES (
          ${log.company_id},
          ${log.timestamp},
          ${log.severity},
          ${log.summary},
          ${log.detail_json ? JSON.stringify(log.detail_json) : null},
          ${JSON.stringify(log.sources_checked)}
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully with ${seeded} companies and ${actionLogs.length} action logs`,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
