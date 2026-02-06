interface ValuationScenario {
  label: string;
  targetPrice: string;
  methodology: string;
  upside: string;
}

interface ValuationMetric {
  label: string;
  current: string;
  sectorAvg?: string;
}

interface ValuationBoxProps {
  currentPrice?: string;
  metrics: ValuationMetric[];
  scenarios: ValuationScenario[];
  fairValue?: string;
  notes?: string;
}

function UpsideBadge({ upside }: { upside: string }) {
  const num = parseFloat(upside);
  if (isNaN(num)) return <span className="text-xs text-gray-400">{upside}</span>;
  const color = num > 0 ? "text-green-600 bg-green-50" : num < 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {num > 0 ? "+" : ""}{upside}
    </span>
  );
}

export default function ValuationBox({
  currentPrice,
  metrics,
  scenarios,
  fairValue,
  notes,
}: ValuationBoxProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        Valuation
      </h2>

      {/* Current price + fair value */}
      {(currentPrice || fairValue) && (
        <div className="flex items-center gap-6 mb-5 pb-5 border-b border-gray-100">
          {currentPrice && (
            <div>
              <span className="text-xs text-gray-500">Current Price</span>
              <p className="text-lg font-semibold text-gray-900 font-mono">{currentPrice}</p>
            </div>
          )}
          {fairValue && (
            <div>
              <span className="text-xs text-gray-500">Fair Value (est.)</span>
              <p className="text-lg font-semibold text-blue-600 font-mono">{fairValue}</p>
            </div>
          )}
        </div>
      )}

      {/* Metrics */}
      {metrics.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">
            Multiples
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 font-mono">
                    {m.current}
                  </span>
                  {m.sectorAvg && (
                    <span className="text-xs text-gray-400">
                      vs. {m.sectorAvg}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenarios */}
      {scenarios.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">
            Scenarios
          </h3>
          <div className="space-y-3">
            {scenarios.map((s, i) => (
              <div
                key={i}
                className="rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {s.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 font-mono">
                      {s.targetPrice}
                    </span>
                    <UpsideBadge upside={s.upside} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">{s.methodology}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 leading-relaxed">{notes}</p>
        </div>
      )}
    </div>
  );
}
