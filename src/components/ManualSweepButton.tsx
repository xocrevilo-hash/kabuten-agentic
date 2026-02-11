"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ManualSweepButtonProps {
  companyId: string;
  companyName: string;
  embedded?: boolean;
}

type SweepStatus = "idle" | "running" | "success" | "error";

export default function ManualSweepButton({
  companyId,
  companyName,
  embedded = false,
}: ManualSweepButtonProps) {
  const [status, setStatus] = useState<SweepStatus>("idle");
  const [result, setResult] = useState<{
    classification?: string;
    summary?: string;
    error?: string;
    durationMs?: number;
  } | null>(null);
  const router = useRouter();

  const runSweep = async () => {
    setStatus("running");
    setResult(null);

    try {
      const res = await fetch(`/api/sweep/run?companyId=${companyId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success && data.results?.[0]) {
        const sweepResult = data.results[0];
        if (sweepResult.status === "success") {
          setStatus("success");
          setResult({
            classification: sweepResult.classification,
            summary: sweepResult.summary,
            durationMs: sweepResult.durationMs,
          });
          router.refresh();
        } else {
          setStatus("error");
          setResult({ error: sweepResult.error });
        }
      } else {
        setStatus("error");
        setResult({ error: data.error || "Unknown error" });
      }
    } catch (err) {
      setStatus("error");
      setResult({
        error: err instanceof Error ? err.message : "Network error",
      });
    }
  };

  const classificationColors: Record<string, string> = {
    NO_CHANGE: "text-gray-500",
    NOTABLE: "text-amber-600",
    MATERIAL: "text-red-600",
  };

  const Wrapper = embedded ? "div" : ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-6">{children}</div>
  );

  return (
    <Wrapper>
      {!embedded && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Manual Sweep
          </h2>
        </div>
      )}

      {!embedded && (
        <p className="text-xs text-gray-500 mb-4">
          Run an ad-hoc sweep for {companyName} outside the daily cron schedule.
        </p>
      )}

      <button
        onClick={runSweep}
        disabled={status === "running"}
        className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
          status === "running"
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950"
        }`}
      >
        {status === "running" ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running sweep...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Run Sweep Now
          </>
        )}
      </button>

      {/* Result display */}
      {result && status !== "running" && (
        <div className={`mt-3 rounded-lg p-3 text-sm ${
          status === "error" ? "bg-red-50" : "bg-gray-50"
        }`}>
          {status === "success" && result.classification && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Result:</span>
                <span className={`text-xs font-semibold ${classificationColors[result.classification] || "text-gray-500"}`}>
                  {result.classification}
                </span>
              </div>
              <p className="text-gray-700">{result.summary}</p>
              {result.durationMs && (
                <p className="text-xs text-gray-400">
                  Completed in {Math.round(result.durationMs / 1000)}s
                </p>
              )}
            </div>
          )}
          {status === "error" && (
            <div className="flex items-start gap-2">
              <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-700">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </Wrapper>
  );
}
