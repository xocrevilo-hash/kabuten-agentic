"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface SectorCompany {
  id: string;
  name: string;
  ticker: string;
  stance: string;
  conviction: string;
}

interface SectorLogEntry {
  id: number;
  logDate: string;
  classification: string;
  summary: string;
  relatedCompanies: string[];
  createdAt: string;
}

interface SectorView {
  stance: string;
  conviction: string;
  thesisSummary: string;
  valuationAssessment: string[];
  convictionRationale: string[];
  keyDrivers: string[];
  keyRisks: string[];
  lastUpdated: string;
  lastUpdatedReason: string;
}

interface SectorData {
  name: string;
  label: string;
  companyCount: number;
  bullish: number;
  neutral: number;
  bearish: number;
  lastMaterialDate: string | null;
  sectorView: SectorView | null;
  companies: SectorCompany[];
  log: SectorLogEntry[];
}

function classificationBadge(classification: string) {
  const map: Record<string, { color: string; icon: string }> = {
    MATERIAL: { color: "text-red-600 bg-red-50 border-red-200", icon: "\ud83d\udd34" },
    INCREMENTAL: { color: "text-amber-600 bg-amber-50 border-amber-200", icon: "\ud83d\udfe1" },
    NO_CHANGE: { color: "text-gray-500 bg-gray-50 border-gray-200", icon: "\u26aa" },
  };
  const m = map[classification] || map.NO_CHANGE;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${m.color}`}>
      {m.icon} {classification.replace("_", " ")}
    </span>
  );
}

function stanceBadge(stance: string) {
  const styles: Record<string, string> = {
    bullish: "bg-green-50 text-green-700 border-green-200",
    bearish: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles[stance] || styles.neutral}`}>
      {stance === "bullish" && "\u2191 "}
      {stance === "bearish" && "\u2193 "}
      {stance === "neutral" && "\u2192 "}
      {stance}
    </span>
  );
}

function convictionStars(conviction: string) {
  const levels: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const level = levels[conviction] || 2;
  return (
    <span className="text-sm">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= level ? "text-gray-800" : "text-gray-300"}>&#9733;</span>
      ))}
    </span>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SectorsPage() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [activeSector, setActiveSector] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load sector summary data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/sectors");
        const data = await res.json();
        if (data.sectors && data.sectors.length > 0) {
          setSectors(data.sectors);
          setActiveSector(data.sectors[0].name);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Load detail for active sector (log + companies)
  const loadSectorDetail = useCallback(async (sectorName: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/sectors?sector=${sectorName}`);
      const data = await res.json();
      if (data.sectors && data.sectors.length > 0) {
        setSectors((prev) =>
          prev.map((s) => (s.name === sectorName ? { ...s, ...data.sectors[0] } : s))
        );
      }
    } catch {
      // Silent fail
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSector) {
      loadSectorDetail(activeSector);
    }
  }, [activeSector, loadSectorDetail]);

  const active = sectors.find((s) => s.name === activeSector);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading sectors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sector Agent</h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-driven sector views synthesised from individual company Daily Sweeps
          </p>
        </div>

        {/* Sector Toggle Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {sectors.map((sector) => (
            <button
              key={sector.name}
              onClick={() => setActiveSector(sector.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeSector === sector.name
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {sector.label} ({sector.companyCount})
            </button>
          ))}
        </div>

        {active && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{active.companyCount}</div>
                <div className="text-xs text-gray-500">Companies</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{active.bullish}</div>
                <div className="text-xs text-gray-500">Bullish</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{active.neutral}</div>
                <div className="text-xs text-gray-500">Neutral</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{active.bearish}</div>
                <div className="text-xs text-gray-500">Bearish</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
                <div className="text-sm font-bold text-gray-900">{formatDate(active.lastMaterialDate)}</div>
                <div className="text-xs text-gray-500">Last Material</div>
              </div>
            </div>

            {/* Two-Column Layout: Sector Investment View (left) + Sector Agent Log (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left: Sector Investment View */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Sector Investment View
                  </h2>
                  {active.sectorView && (
                    <span className="text-xs text-gray-400">
                      Updated: {formatDateTime(active.sectorView.lastUpdated)}
                    </span>
                  )}
                </div>

                {active.sectorView ? (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      {stanceBadge(active.sectorView.stance)}
                      {convictionStars(active.sectorView.conviction)}
                    </div>

                    {/* Thesis */}
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Thesis</h3>
                      <p className="text-sm text-gray-800 leading-relaxed">{active.sectorView.thesisSummary}</p>
                    </div>

                    {/* Valuation Assessment */}
                    {active.sectorView.valuationAssessment?.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Valuation Assessment</h3>
                        <ul className="space-y-1">
                          {active.sectorView.valuationAssessment.slice(0, 4).map((v: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5 flex-shrink-0">&#9679;</span>
                              {v}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Drivers & Key Risks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {active.sectorView.keyDrivers?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Drivers</h3>
                          <ul className="space-y-1">
                            {active.sectorView.keyDrivers.slice(0, 3).map((d: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {active.sectorView.keyRisks?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Risks</h3>
                          <ul className="space-y-1">
                            {active.sectorView.keyRisks.slice(0, 3).map((r: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-red-500 mt-0.5 flex-shrink-0">&ndash;</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Conviction Rationale */}
                    {active.sectorView.convictionRationale?.length > 0 && (
                      <div className="mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Conviction Rationale</h3>
                        <ul className="space-y-1">
                          {active.sectorView.convictionRationale.slice(0, 4).map((c: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5 flex-shrink-0">&#8227;</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {active.sectorView.lastUpdatedReason && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          <span className="font-medium">Trigger:</span> {active.sectorView.lastUpdatedReason}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-400 py-8 text-center">
                    No sector view yet. The sector agent will synthesise a view after the next daily sweep completes.
                  </div>
                )}
              </div>

              {/* Right: Sector Agent Log */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Sector Agent Log
                </h2>

                {detailLoading ? (
                  <div className="text-sm text-gray-400 py-8 text-center">Loading log...</div>
                ) : active.log && active.log.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {active.log.map((entry) => (
                      <div key={entry.id} className="border-b border-gray-50 pb-3 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400">{formatDate(entry.logDate || entry.createdAt)}</span>
                          {classificationBadge(entry.classification)}
                        </div>
                        <p className="text-sm text-gray-700">{entry.summary}</p>
                        {entry.relatedCompanies && entry.relatedCompanies.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {entry.relatedCompanies.map((company: string, i: number) => (
                              <span key={i} className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {company}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 py-8 text-center">
                    No log entries yet. Sector agent log will populate after the next daily sweep.
                  </div>
                )}
              </div>
            </div>

            {/* Companies Grid (full width) */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Companies in {active.label}
              </h2>
              <div className="flex flex-wrap gap-2">
                {active.companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/company/${company.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
                  >
                    <span className="font-medium text-gray-900">{company.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{company.ticker}</span>
                    {stanceBadge(company.stance)}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
