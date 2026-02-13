import { NextResponse } from "next/server";

export const maxDuration = 300;

export async function POST() {
  try {
    const { getCompanies, getDb } = await import("@/lib/db");
    const { generateInvestmentView } = await import("@/lib/claude");

    const companies = await getCompanies();
    const sql = getDb();
    const results: { id: string; name: string; status: string }[] = [];

    for (const company of companies) {
      try {
        const profile = company.profile_json as Record<string, unknown>;
        const ivDetail = await generateInvestmentView({
          companyName: company.name,
          ticker: company.ticker_full,
          sector: company.sector || "",
          overview: (profile.overview as string) || "",
          currentThesis: (profile.thesis as string) || "",
          currentView: company.investment_view || "neutral",
          currentConviction: company.conviction || "medium",
          keyAssumptions: (profile.key_assumptions as string[]) || [],
          riskFactors: (profile.risk_factors as string[]) || [],
        });

        // Merge investment_view_detail into profile_json
        const updatedProfile = { ...profile, investment_view_detail: ivDetail };

        await sql`
          UPDATE companies
          SET profile_json = ${JSON.stringify(updatedProfile)},
              investment_view = ${ivDetail.stance},
              conviction = ${ivDetail.conviction},
              updated_at = NOW()
          WHERE id = ${company.id}
        `;

        results.push({ id: company.id, name: company.name, status: "success" });

        // Small delay to respect API rate limits
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        results.push({
          id: company.id,
          name: company.name,
          status: `error: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: companies.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
