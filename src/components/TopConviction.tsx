import Link from "next/link";

interface Company {
  id: string;
  name: string;
  ticker_full: string;
  investment_view: string;
  conviction: string;
  profile_json: {
    thesis?: string;
    [key: string]: unknown;
  };
  last_material_at?: string | null;
}

interface TopConvictionProps {
  companies: Company[];
}

function convictionScore(conviction: string): number {
  if (conviction === "high") return 3;
  if (conviction === "medium") return 2;
  if (conviction === "low") return 1;
  return 0;
}

function convictionStars(conviction: string): string {
  if (conviction === "high") return "\u2605\u2605\u2605";
  if (conviction === "medium") return "\u2605\u2605\u2606";
  if (conviction === "low") return "\u2605\u2606\u2606";
  return "\u2606\u2606\u2606";
}

export default function TopConviction({ companies }: TopConvictionProps) {
  // Filter bullish companies, sort by conviction (high → medium → low), then by last_material_at
  const bullish = companies
    .filter((c) => c.investment_view === "bullish")
    .sort((a, b) => {
      const scoreA = convictionScore(a.conviction);
      const scoreB = convictionScore(b.conviction);
      if (scoreB !== scoreA) return scoreB - scoreA;
      // Tie-break by most recent material finding
      const dateA = a.last_material_at ? new Date(a.last_material_at).getTime() : 0;
      const dateB = b.last_material_at ? new Date(b.last_material_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 20);

  if (bullish.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        Highest Conviction Top {Math.min(bullish.length, 20)}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-2 text-xs font-medium text-gray-500 w-8">#</th>
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Company</th>
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Ticker</th>
              <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Rating</th>
              <th className="text-left py-2 pl-2 text-xs font-medium text-gray-500">Investment View</th>
            </tr>
          </thead>
          <tbody>
            {bullish.map((company, i) => (
              <tr key={company.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-2.5 pr-2 text-gray-400 font-mono text-xs">{i + 1}</td>
                <td className="py-2.5 px-2">
                  <Link
                    href={`/company/${company.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {company.name}
                  </Link>
                </td>
                <td className="py-2.5 px-2 text-xs text-gray-500 font-mono">{company.ticker_full}</td>
                <td className="py-2.5 px-2 text-center text-amber-500 text-sm tracking-wider">
                  {convictionStars(company.conviction)}
                </td>
                <td className="py-2.5 pl-2 text-xs text-gray-600 max-w-xs truncate">
                  {company.profile_json?.thesis
                    ? company.profile_json.thesis.substring(0, 120) + (company.profile_json.thesis.length > 120 ? "..." : "")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
