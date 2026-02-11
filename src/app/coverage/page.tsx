import CompanyTable from "@/components/CompanyTable";
import { fetchCompanies } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CoveragePage() {
  const companies = await fetchCompanies();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Coverage Universe</h1>
          <p className="text-sm text-gray-500 mt-1">
            {companies.length} companies across US, Japan, Korea, Taiwan, China, Hong Kong, India & Australia
          </p>
        </div>

        <CompanyTable
          companies={companies.map((c) => ({
            id: c.id,
            name: c.name,
            ticker_full: c.ticker_full,
            country: c.country,
            classification: c.classification,
            market_cap_usd: c.market_cap_usd,
            investment_view: c.investment_view,
            conviction: c.conviction,
          }))}
        />
      </div>
    </div>
  );
}
