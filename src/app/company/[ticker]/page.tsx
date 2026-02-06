import { notFound } from "next/navigation";
import Link from "next/link";
import KabutenLogo from "@/components/KabutenLogo";
import InvestmentView from "@/components/InvestmentView";
import SweepCriteria from "@/components/SweepCriteria";
import ActionLog from "@/components/ActionLog";
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
        {/* Top Section: Investment View + Sweep Criteria */}
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
          <div>
            <SweepCriteria
              sources={criteria.sources}
              focus={criteria.focus}
            />
          </div>
        </div>

        {/* Key Info + Overview */}
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
                <dt className="text-xs text-gray-500">Japanese Name</dt>
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
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Company Overview
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {profile.overview}
            </p>
          </div>
        </div>

        {/* Action Log */}
        <ActionLog
          entries={actionLog}
          title={`Action Log — ${company.name}`}
          showCompany={false}
        />
      </div>
    </div>
  );
}
