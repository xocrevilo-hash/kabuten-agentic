import Link from "next/link";

interface CompanyCardProps {
  id: string;
  name: string;
  tickerFull: string;
  investmentView: string;
  conviction: string;
  lastSweepAt: string | null;
  sector: string;
}

function ViewArrow({ view }: { view: string }) {
  if (view === "bullish") {
    return <span className="text-green-600 text-xl font-bold">&uarr;</span>;
  }
  if (view === "bearish") {
    return <span className="text-red-600 text-xl font-bold">&darr;</span>;
  }
  return <span className="text-amber-500 text-xl font-bold">&rarr;</span>;
}

function formatTimestamp(ts: string | null) {
  if (!ts) return "Never";
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CompanyCard({
  id,
  name,
  tickerFull,
  investmentView,
  conviction,
  lastSweepAt,
  sector,
}: CompanyCardProps) {
  return (
    <Link href={`/company/${id}`}>
      <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md hover:border-gray-300 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
            <p className="text-sm text-gray-500 font-mono">{tickerFull}</p>
          </div>
          <ViewArrow view={investmentView} />
        </div>
        <p className="text-xs text-gray-400 mb-4 line-clamp-1">{sector}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">View:</span>
            <span className={`font-medium capitalize ${
              investmentView === "bullish" ? "text-green-600" :
              investmentView === "bearish" ? "text-red-600" :
              "text-amber-600"
            }`}>
              {investmentView}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Conviction:</span>
            <span className="font-medium text-gray-700 capitalize">{conviction}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Last sweep</span>
          <span className="text-xs text-gray-500">{formatTimestamp(lastSweepAt)}</span>
        </div>
      </div>
    </Link>
  );
}
