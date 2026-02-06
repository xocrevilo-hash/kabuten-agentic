interface EarningsRow {
  period: string;
  revenue: string;
  operatingProfit: string;
  netProfit: string;
  eps: string;
  isEstimate?: boolean;
}

interface EarningsModelProps {
  rows: EarningsRow[];
  segments?: { name: string; revenue: string; share: string }[];
  currency?: string;
}

export default function EarningsModel({
  rows,
  segments,
  currency = "JPY",
}: EarningsModelProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        Earnings Model
      </h2>

      {/* Financials table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">
                Period
              </th>
              <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">
                Revenue ({currency})
              </th>
              <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">
                Op. Profit
              </th>
              <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">
                Net Profit
              </th>
              <th className="text-right py-2 pl-3 text-xs font-medium text-gray-500">
                EPS
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-50 ${
                  row.isEstimate ? "bg-blue-50/30" : ""
                }`}
              >
                <td className="py-2 pr-4 text-gray-700 font-medium whitespace-nowrap">
                  {row.period}
                  {row.isEstimate && (
                    <span className="ml-1.5 text-[10px] text-blue-500 font-normal">
                      EST
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-right text-gray-700 font-mono text-xs">
                  {row.revenue}
                </td>
                <td className="py-2 px-3 text-right text-gray-700 font-mono text-xs">
                  {row.operatingProfit}
                </td>
                <td className="py-2 px-3 text-right text-gray-700 font-mono text-xs">
                  {row.netProfit}
                </td>
                <td className="py-2 pl-3 text-right text-gray-700 font-mono text-xs">
                  {row.eps}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Segments breakdown */}
      {segments && segments.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">
            Revenue by Segment
          </h3>
          <div className="space-y-2">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm text-gray-700 truncate">
                    {seg.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-mono">
                    {seg.revenue}
                  </span>
                  <div className="w-20">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full"
                        style={{
                          width: seg.share,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {seg.share}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
