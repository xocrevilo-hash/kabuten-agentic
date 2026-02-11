"use client";

import { useState, useCallback } from "react";
import ManualSweepButton from "@/components/ManualSweepButton";

interface SweepCriteriaProps {
  companyId: string;
  companyName: string;
  sources: string[];
  focus: string[];
}

const ACTIVE_SOURCES = [
  { key: "company_ir", label: "Company IR Page" },
  { key: "edinet", label: "EDINET Filings" },
  { key: "reuters_nikkei", label: "Reuters / Nikkei" },
  { key: "twitter", label: "X.com / Twitter" },
  { key: "tradingview", label: "TradingView" },
  { key: "industry", label: "Industry Sources" },
];

const PLANNED_SOURCES = [
  { key: "reddit", label: "Reddit", note: "Pending" },
  { key: "bloomberg", label: "Bloomberg Inbox", note: "Pending" },
  { key: "alphasense", label: "Alphasense", note: "Pending" },
  { key: "internal", label: "Internal Research", note: "Pending" },
];

export default function SweepCriteria({
  companyId,
  companyName,
  sources: initialSources,
  focus: initialFocus,
}: SweepCriteriaProps) {
  const [sources, setSources] = useState<string[]>(initialSources);
  const [focus, setFocus] = useState<string[]>(initialFocus);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFocus, setEditFocus] = useState<string[]>(initialFocus);
  const [editSources, setEditSources] = useState<string[]>(initialSources);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/criteria/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: editSources, focus: editFocus }),
      });
      if (res.ok) {
        setSources(editSources);
        setFocus(editFocus);
        setIsEditing(false);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }, [companyId, editSources, editFocus]);

  const cancel = () => {
    setEditSources(sources);
    setEditFocus(focus);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditSources([...sources]);
    setEditFocus([...focus]);
    setIsEditing(true);
  };

  const toggleSource = (key: string) => {
    setEditSources((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const updateBullet = (index: number, value: string) => {
    setEditFocus((prev) => prev.map((b, i) => (i === index ? value : b)));
  };

  const addBullet = () => {
    setEditFocus((prev) => [...prev, ""]);
  };

  const removeBullet = (index: number) => {
    setEditFocus((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        Daily Sweep Criteria
      </h2>

      {/* Manual Sweep embedded */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <ManualSweepButton
          companyId={companyId}
          companyName={companyName}
          embedded
        />
      </div>

      {/* Two-column interior: Sources (left), Focus (right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Sources */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Sources</h3>
          <div className="space-y-1.5">
            {ACTIVE_SOURCES.map((source) => {
              const enabled = isEditing
                ? editSources.includes(source.key)
                : sources.includes(source.key);

              return (
                <div key={source.key} className="flex items-center gap-2 text-sm">
                  {isEditing ? (
                    <button
                      onClick={() => toggleSource(source.key)}
                      className={`flex items-center gap-2 w-full text-left py-0.5 rounded transition-colors ${
                        enabled ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          enabled
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {enabled && (
                          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {source.label}
                    </button>
                  ) : (
                    <div className={`flex items-center gap-2 ${enabled ? "text-gray-700" : "text-gray-400"}`}>
                      {enabled ? (
                        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="h-4 w-4 rounded border border-gray-300" />
                      )}
                      {source.label}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Planned sources with red X */}
            {PLANNED_SOURCES.map((source) => (
              <div key={source.key} className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{source.label}</span>
                <span className="text-[10px] text-gray-300 italic">({source.note})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Focus + Edit */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Focus</h3>
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={cancel}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              {editFocus.map((bullet, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-2 flex-shrink-0">&bull;</span>
                  <textarea
                    value={bullet}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    rows={2}
                    className="flex-1 text-sm text-gray-700 leading-relaxed rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 resize-none"
                  />
                  <button
                    onClick={() => removeBullet(i)}
                    className="text-gray-300 hover:text-red-400 mt-1.5 transition-colors flex-shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={addBullet}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium mt-1 transition-colors"
              >
                + Add focus area
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {focus.map((bullet, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed pl-4 relative">
                  <span className="absolute left-0 text-gray-400">&bull;</span>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
