import { notFound } from "next/navigation";
import InvestmentView from "@/components/InvestmentView";
import SweepCriteria from "@/components/SweepCriteria";
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
  const isJapanese = company.country === "Japan";

  return (
    <div className="min-h-screen">
      {/* Company Header */}
      <div className="border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-baseline gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{company.name}</h1>
          <span className="text-sm text-gray-500 font-mono">{company.ticker_full}</span>
          {company.name_jp && (
            <span className="text-sm text-gray-400">{company.name_jp}</span>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Top section: two columns — Investment View (left), Agent Log (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Investment View */}
          <InvestmentView
            investmentView={company.investment_view}
            conviction={company.conviction}
            thesis={profile.thesis}
            keyAssumptions={profile.key_assumptions}
            riskFactors={profile.risk_factors}
            lastUpdated={company.updated_at}
          />

          {/* Right: Analyst Agent Log */}
          <ActionLog
            entries={actionLog}
            title={`Analyst Agent Log — ${company.name}`}
            showCompany={false}
          />
        </div>

        {/* Below: centered sections */}
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Sweep Criteria (with embedded Manual Sweep, two-column interior) */}
          <SweepCriteria
            companyId={company.id}
            companyName={company.name}
            sources={criteria.sources}
            focus={criteria.focus}
          />

          {/* EDINET Filing Source */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              EDINET Filings
            </h2>
            <div className={`flex items-center gap-2 ${isJapanese ? "text-green-600" : "text-gray-400"}`}>
              {isJapanese ? (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">EDINET source active</span>
                  <span className="text-xs text-gray-400 ml-1">(Japan only)</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">EDINET not applicable</span>
                  <span className="text-xs text-gray-300 ml-1">(Japan only)</span>
                </>
              )}
            </div>
          </div>

          {/* Key Information */}
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
                <dt className="text-xs text-gray-500">Exchange</dt>
                <dd className="text-sm font-medium text-gray-900">{company.exchange || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Country</dt>
                <dd className="text-sm font-medium text-gray-900">{company.country || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Market Cap (USD bn)</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {company.market_cap_usd ? `$${company.market_cap_usd.toLocaleString()}B` : "\u2014"}
                </dd>
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

          {/* Share Price Chart */}
          <SharePriceChart
            ticker={company.ticker_full}
            companyName={company.name}
          />

          {/* Earnings Model */}
          {profile.earnings && profile.earnings.length > 0 && (
            <EarningsModel
              rows={profile.earnings}
              segments={profile.segments}
            />
          )}

          {/* Valuation */}
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
