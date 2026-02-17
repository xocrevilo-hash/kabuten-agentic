"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ActionLogEntry {
  id: number;
  company_id: string;
  company_name: string;
  timestamp: string;
  severity: string;
  summary: string;
  detail_json: {
    what_happened?: string;
    why_it_matters?: string;
    recommended_action?: string;
    confidence?: string;
    sources?: string[];
  } | null;
  sources_checked?: string[];
}

const SOURCE_LABELS: Record<string, string> = {
  company_ir: "IR Page",
  edinet: "EDINET",
  reuters_nikkei: "News",
  twitter: "X/Twitter",
  tradingview: "Price",
  industry: "Industry",
};

interface ActionLogProps {
  entries: ActionLogEntry[];
  title?: string;
  showCompany?: boolean;
}

function SeverityDot({ severity }: { severity: string }) {
  if (severity === "material") {
    return <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" title="Material" />;
  }
  if (severity === "notable" || severity === "incremental") {
    return <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" title="Incremental" />;
  }
  return <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300" title="No Change" />;
}

function SeverityLabel({ severity }: { severity: string }) {
  if (severity === "material") {
    return <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Material</span>;
  }
  if (severity === "notable" || severity === "incremental") {
    return <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Incremental</span>;
  }
  return <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">No Change</span>;
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LogEntry({
  entry,
  showCompany,
}: {
  entry: ActionLogEntry;
  showCompany: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = (entry.detail_json && entry.severity !== "no_change") || (entry.sources_checked && entry.sources_checked.length > 0);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => hasDetail && setExpanded(!expanded)}
        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
          hasDetail ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="mt-1.5 flex-shrink-0">
          <SeverityDot severity={entry.severity} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-mono">
              {formatTimestamp(entry.timestamp)}
            </span>
            {showCompany && entry.company_id && (
              <Link
                href={`/company/${entry.company_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {entry.company_name}
              </Link>
            )}
            <SeverityLabel severity={entry.severity} />
          </div>
          <p className="text-sm text-gray-700 mt-1">{entry.summary}</p>
        </div>
        {hasDetail && (
          <svg
            className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1.5 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pl-10">
          {entry.detail_json && entry.severity !== "no_change" && (
            <div className="rounded-lg bg-gray-50 p-4 space-y-3 text-sm mb-3">
              {entry.detail_json.what_happened && (
                <div>
                  <span className="font-medium text-gray-600">What happened:</span>
                  <p className="text-gray-700 mt-0.5">{entry.detail_json.what_happened}</p>
                </div>
              )}
              {entry.detail_json.why_it_matters && (
                <div>
                  <span className="font-medium text-gray-600">Why it matters:</span>
                  <p className="text-gray-700 mt-0.5">{entry.detail_json.why_it_matters}</p>
                </div>
              )}
              {entry.detail_json.recommended_action && (
                <div>
                  <span className="font-medium text-gray-600">Recommended action:</span>
                  <p className="text-gray-700 mt-0.5">{entry.detail_json.recommended_action}</p>
                </div>
              )}
              {entry.detail_json.confidence && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Confidence:</span>
                  <span className="capitalize text-gray-700">{entry.detail_json.confidence}</span>
                </div>
              )}
              {entry.detail_json.sources && entry.detail_json.sources.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-600">Sources:</span>
                  {entry.detail_json.sources.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {entry.sources_checked && entry.sources_checked.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-400">Checked:</span>
              {entry.sources_checked.map((s) => (
                <span
                  key={s}
                  className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                >
                  {SOURCE_LABELS[s] || s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ActionLog({ entries, title = "Analyst Agent Log", showCompany = true }: ActionLogProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {title}
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {entries.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No sweep activity yet
          </div>
        ) : (
          entries.map((entry) => (
            <LogEntry key={entry.id} entry={entry} showCompany={showCompany} />
          ))
        )}
      </div>
    </div>
  );
}

function PageControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <span className="text-xs text-gray-400 px-2">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}

export function PaginatedActionLog({
  title = "Analyst Agent Log",
  pageSize = 50,
  showCompany = true,
}: {
  title?: string;
  pageSize?: number;
  showCompany?: boolean;
}) {
  const [entries, setEntries] = useState<ActionLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const offset = (p - 1) * pageSize;
      const res = await fetch(`/api/action-log?limit=${pageSize}&offset=${offset}`);
      const data = await res.json();
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {title}
        </h2>
        {total > 0 && (
          <span className="text-xs text-gray-400">{total} entries</span>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No sweep activity yet
          </div>
        ) : (
          entries.map((entry) => (
            <LogEntry key={entry.id} entry={entry} showCompany={showCompany} />
          ))
        )}
      </div>
      {!loading && <PageControls page={page} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
