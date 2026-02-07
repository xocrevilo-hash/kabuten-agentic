import { notFound } from "next/navigation";
import Link from "next/link";
import KabutenLogo from "@/components/KabutenLogo";
import InvestmentView from "@/components/InvestmentView";
import SweepCriteria from "@/components/SweepCriteria";
import ManualSweepButton from "@/components/ManualSweepButton";
import ActionLog from "@/components/ActionLog";
import SharePriceChart from "@/components/SharePriceChart";
import EarningsModel from "@/components/EarningsModel";
import ValuationBox from "@/components/ValuationBox";
import { fetchCompany, fetchActionLog } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const company = await fetchCompany(ticker);

  if (!company) {
    notFound();
  }

  const actionLog = await fetchActionLog(ticker);

  const profile = company.profile_json;
  const criteria = company.sweep_criteria_json;

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/">
            <KabutenLogo variant="navbar" />
          </Link>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold text-gray-900">{company.name}</h1>
            <span className="text-sm text-gray-500 font-mono">{company.ticker_full}</span>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Section: Investment View + Manual Sweep + Sweep Criteria */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <InvestmentView
              investmentView={company.investment_view}
              conviction={company.conviction}
              thesis={profile.thesis}
              keyAssumptions={profile.key_assumptions}
              riskFactors={profile.risk_factors}
              lastUpdated={company.updated_at}
            />
          </div>
          <div className="space-y-6">
            <ManualSweepButton
              companyId={company.id}
              companyName={company.name}
            />
            <SweepCriteria
              companyId={company.id}
              sources={criteria.sources}
              focus={criteria.focus}
            />
          </div>
        </div>

        {/* Analyst Agent Log */}
        <div className="mb-8">
          <ActionLog
            entries={actionLog}
            title={`Analyst Agent Log — ${company.name}`}
            showCompany={false}
          />
        </div>

        {/* Key Info + Share Price Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Key Information
            </h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500">Company</dt>
                <dd className="text-sm font-medium text-gray-900">{company.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Local Name</dt>
                <dd className="text-sm font-medium text-gray-900">{company.name_jp}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Ticker</dt>
                <dd className="text-sm font-medium text-gray-900 font-mono">{company.ticker_full}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Sector</dt>
                <dd className="text-sm font-medium text-gray-900">{company.sector}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Investment View</dt>
                <dd className={`text-sm font-semibold capitalize ${
                  company.investment_view === "bullish" ? "text-green-600" :
                  company.investment_view === "bearish" ? "text-red-600" :
                  "text-amber-600"
                }`}>
                  {company.investment_view}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Conviction</dt>
                <dd className="text-sm font-semibold text-gray-900 capitalize">{company.conviction}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Last Sweep</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {company.last_sweep_at
                    ? new Date(company.last_sweep_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not yet run"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Last Material Finding</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {company.last_material_at
                    ? new Date(company.last_material_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "None"}
                </dd>
              </div>
            </dl>

            {/* Company Overview */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Overview</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {profile.overview}
              </p>
            </div>
          </div>

          <SharePriceChart
            ticker={company.ticker_full}
            companyName={company.name}
          />
        </div>

        {/* Earnings Model + Valuation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profile.earnings && profile.earnings.length > 0 && (
            <EarningsModel
              rows={profile.earnings}
              segments={profile.segments}
            />
          )}
          {profile.valuation_metrics && profile.valuation_scenarios && (
            <ValuationBox
              currentPrice={profile.current_price}
              fairValue={profile.fair_value}
              metrics={profile.valuation_metrics}
              scenarios={profile.valuation_scenarios}
              notes={profile.valuation_notes}
            />
          )}
        </div>
      </div>
    </div>
  );
}
