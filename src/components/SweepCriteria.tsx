interface SweepCriteriaProps {
  sources: string[];
  focus: string[];
}

const SOURCE_LABELS: Record<string, string> = {
  company_ir: "Company IR Page",
  edinet: "EDINET Filings",
  reuters_nikkei: "Reuters / Nikkei",
  twitter: "X.com / Twitter",
  tradingview: "TradingView",
  industry: "Industry Sources",
};

export default function SweepCriteria({ sources, focus }: SweepCriteriaProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        Daily Sweep Criteria
      </h2>

      <div className="mb-5">
        <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Sources</h3>
        <div className="space-y-1.5">
          {sources.map((source) => (
            <div key={source} className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {SOURCE_LABELS[source] || source}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Focus</h3>
        <ul className="space-y-2">
          {focus.map((bullet, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed pl-4 relative">
              <span className="absolute left-0 text-gray-400">&bull;</span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
