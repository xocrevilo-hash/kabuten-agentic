import { NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/lib/db";
import seedData from "../../../../data/seed.json";

export async function POST() {
  try {
    await initializeDatabase();
    const sql = getDb();

    for (const company of seedData.companies) {
      await sql`
        INSERT INTO companies (id, name, name_jp, ticker_full, sector, profile_json, sweep_criteria_json, investment_view, conviction)
        VALUES (
          ${company.id},
          ${company.name},
          ${company.name_jp},
          ${company.ticker_full},
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
          sector = EXCLUDED.sector,
          profile_json = EXCLUDED.profile_json,
          sweep_criteria_json = EXCLUDED.sweep_criteria_json,
          investment_view = EXCLUDED.investment_view,
          conviction = EXCLUDED.conviction,
          updated_at = NOW()
      `;
    }

    for (const log of seedData.action_log) {
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

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
