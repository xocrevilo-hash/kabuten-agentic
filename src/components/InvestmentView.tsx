interface InvestmentViewProps {
  investmentView: string;
  conviction: string;
  thesis: string;
  valuationAssessment?: string[];
  keyDrivers?: string[];
  keyRisks?: string[];
  convictionRationale?: string[];
  lastUpdated: string | null;
  lastUpdatedReason?: string;
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

function ConvictionStars({ conviction }: { conviction: string }) {
  const levels = { low: 1, medium: 2, high: 3 };
  const level = levels[conviction as keyof typeof levels] || 2;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-gray-500">Conviction:</span>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`text-base ${i <= level ? "text-gray-800" : "text-gray-300"}`}>
            &#9733;
          </span>
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
  valuationAssessment,
  keyDrivers,
  keyRisks,
  convictionRationale,
  lastUpdated,
  lastUpdatedReason,
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
        <ConvictionStars conviction={conviction} />
      </div>

      {/* Thesis — max 100 words */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Thesis</h3>
        <p className="text-sm text-gray-800 leading-relaxed">{thesis}</p>
      </div>

      {/* Valuation Assessment — max 4 bullets */}
      {valuationAssessment && valuationAssessment.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Valuation Assessment</h3>
          <ul className="space-y-1.5">
            {valuationAssessment.slice(0, 4).map((v, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">&#9679;</span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Drivers & Key Risks — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {keyDrivers && keyDrivers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Drivers</h3>
            <ul className="space-y-1.5">
              {keyDrivers.slice(0, 3).map((d, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
        {keyRisks && keyRisks.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Risks</h3>
            <ul className="space-y-1.5">
              {keyRisks.slice(0, 3).map((r, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">&ndash;</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Conviction Rationale — max 4 bullets */}
      {convictionRationale && convictionRationale.length > 0 && (
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Conviction Rationale</h3>
          <ul className="space-y-1.5">
            {convictionRationale.slice(0, 4).map((c, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">&#8227;</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Last updated reason */}
      {lastUpdatedReason && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            <span className="font-medium">Trigger:</span> {lastUpdatedReason}
          </p>
        </div>
      )}
    </div>
  );
}
