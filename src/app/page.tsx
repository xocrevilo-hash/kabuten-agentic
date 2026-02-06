import KabutenLogo from "@/components/KabutenLogo";
import SearchBar from "@/components/SearchBar";
import CompanyCard from "@/components/CompanyCard";
import ActionLog from "@/components/ActionLog";
import { fetchCompanies, fetchActionLog } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [companies, actionLog] = await Promise.all([
    fetchCompanies(),
    fetchActionLog(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center pt-16 pb-10 px-4">
        <KabutenLogo variant="hero" />
        <div className="mt-8 w-full flex justify-center">
          <SearchBar />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Action Log */}
        <div className="mb-10">
          <ActionLog
            entries={actionLog}
            title="Agentic Action Log"
            showCompany={true}
          />
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              id={company.id}
              name={company.name}
              tickerFull={company.ticker_full}
              investmentView={company.investment_view}
              conviction={company.conviction}
              lastSweepAt={company.last_sweep_at}
              sector={company.sector}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
