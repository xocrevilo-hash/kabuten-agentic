import { PaginatedActionLog } from "@/components/ActionLog";

export const dynamic = "force-dynamic";

export default function AgentLogPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Analyst Agent Log</h1>
        <p className="text-sm text-gray-500 mb-6">
          Incremental and Material findings across all covered companies.
        </p>
        <PaginatedActionLog
          title="All Agent Activity"
          pageSize={100}
          showCompany={true}
        />
      </div>
    </div>
  );
}
