import ActionLog from "@/components/ActionLog";
import { fetchActionLog } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AgentLogPage() {
  const actionLog = await fetchActionLog();
  // Only show Incremental and Material entries — exclude No Change
  const filteredLog = actionLog.filter(
    (entry) => entry.severity === "incremental" || entry.severity === "notable" || entry.severity === "material"
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Analyst Agent Log</h1>
        <p className="text-sm text-gray-500 mb-6">
          Incremental and Material findings across all 230 covered companies.
        </p>
        <ActionLog
          entries={filteredLog}
          title="All Agent Activity"
          showCompany={true}
        />
      </div>
    </div>
  );
}
