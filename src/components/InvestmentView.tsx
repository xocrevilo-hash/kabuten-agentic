interface InvestmentViewProps {
  investmentView: string;
  conviction: string;
  thesis: string;
  keyAssumptions: string[];
  riskFactors: string[];
  lastUpdated: string | null;
}

function ViewBadge({ view }: { view: string }) {
  const styles = {
    bullish: "bg-green-50 text-green-700 border-green-200",
    bearish: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const style = styles[view as keyof typeof styles] || styles.neutral;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border capitalize ${style}`}>
      {view === "bullish" && <span className="mr-1">&uarr;</span>}
      {view === "bearish" && <span className="mr-1">&darr;</span>}
      {view === "neutral" && <span className="mr-1">&rarr;</span>}
      {view}
    </span>
  );
}

function ConvictionBar({ conviction }: { conviction: string }) {
  const levels = { low: 1, medium: 2, high: 3 };
  const level = levels[conviction as keyof typeof levels] || 2;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Conviction:</span>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 w-6 rounded-full ${
              i <= level ? "bg-gray-800" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700 capitalize">{conviction}</span>
    </div>
  );
}

function formatTimestamp(ts: string | null) {
  if (!ts) return "Not yet updated";
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InvestmentView({
  investmentView,
  conviction,
  thesis,
  keyAssumptions,
  riskFactors,
  lastUpdated,
}: InvestmentViewProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Investment View
        </h2>
        <span className="text-xs text-gray-400">
          Updated: {formatTimestamp(lastUpdated)}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <ViewBadge view={investmentView} />
        <ConvictionBar conviction={conviction} />
      </div>

      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Thesis</h3>
        <p className="text-sm text-gray-800 leading-relaxed">{thesis}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Key Assumptions</h3>
          <ul className="space-y-1.5">
            {keyAssumptions.map((a, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Risk Factors</h3>
          <ul className="space-y-1.5">
            {riskFactors.map((r, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">&ndash;</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
