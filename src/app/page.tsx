import KabutenLogo from "@/components/KabutenLogo";
import SearchBar from "@/components/SearchBar";
import { PaginatedActionLog } from "@/components/ActionLog";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center pt-16 pb-6 px-4">
        <KabutenLogo variant="hero" />
        <div className="mt-8 w-full flex justify-center">
          <SearchBar />
        </div>
      </div>

      {/* Analyst Agent Log */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <PaginatedActionLog
          title="Analyst Agent Log"
          pageSize={50}
          showCompany={true}
        />
      </div>
    </div>
  );
}
