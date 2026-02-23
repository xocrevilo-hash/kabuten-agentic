"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Keywords & Categories ───────────────────────────────────────────────

const HEATMAP_KEYWORDS: { keyword: string; category: string }[] = [
  // AI & ML
  { keyword: "HBM", category: "AI & ML" },
  { keyword: "AI agents", category: "AI & ML" },
  { keyword: "inference", category: "AI & ML" },
  { keyword: "LLM", category: "AI & ML" },
  { keyword: "AI training", category: "AI & ML" },
  { keyword: "edge AI", category: "AI & ML" },
  { keyword: "autonomous driving", category: "AI & ML" },
  { keyword: "robotics", category: "AI & ML" },
  { keyword: "quantum computing", category: "AI & ML" },
  // Semiconductors
  { keyword: "TSMC", category: "Semiconductors" },
  { keyword: "Nvidia", category: "Semiconductors" },
  { keyword: "semiconductor", category: "Semiconductors" },
  { keyword: "CoWoS", category: "Semiconductors" },
  { keyword: "advanced packaging", category: "Semiconductors" },
  { keyword: "EUV", category: "Semiconductors" },
  { keyword: "foundry", category: "Semiconductors" },
  { keyword: "GPU", category: "Semiconductors" },
  { keyword: "DRAM", category: "Semiconductors" },
  { keyword: "NAND", category: "Semiconductors" },
  { keyword: "custom ASIC", category: "Semiconductors" },
  { keyword: "silicon photonics", category: "Semiconductors" },
  { keyword: "Intel", category: "Semiconductors" },
  { keyword: "AMD", category: "Semiconductors" },
  { keyword: "SK Hynix", category: "Semiconductors" },
  { keyword: "ASML", category: "Semiconductors" },
  // Cloud & Data
  { keyword: "data center", category: "Cloud & Data" },
  { keyword: "cloud capex", category: "Cloud & Data" },
  { keyword: "AI server", category: "Cloud & Data" },
  { keyword: "networking", category: "Cloud & Data" },
  { keyword: "optical transceiver", category: "Cloud & Data" },
  { keyword: "Broadcom", category: "Cloud & Data" },
  { keyword: "Samsung", category: "Cloud & Data" },
  // Hardware
  { keyword: "power semiconductor", category: "Hardware" },
  { keyword: "nuclear power", category: "Hardware" },
  // Regulation & Trade
  { keyword: "chip ban", category: "Regulation & Trade" },
  { keyword: "AI regulation", category: "Regulation & Trade" },
  { keyword: "China sanctions", category: "Regulation & Trade" },
  { keyword: "tariff", category: "Regulation & Trade" },
  // Energy & Materials
  { keyword: "energy transition", category: "Energy & Materials" },
  { keyword: "battery", category: "Energy & Materials" },
];

const CATEGORIES = ["All", "AI & ML", "Semiconductors", "Cloud & Data", "Hardware", "Regulation & Trade", "Energy & Materials"];

// ─── Types ───────────────────────────────────────────────────────────────

interface KeywordData {
  keyword: string;
  category: string;
  heatScore: number;
  colourHex?: string;    // precomputed by cron sweep; overrides derived colour when present
  totalViews: number;
  top3Views: number[];
  sevenDayAvg: number;
  trend: string;
  delta: number;
  scanDate: string;
  source?: string;       // 'claude_websearch' | 'heatmap_snapshots'
}

type ScanState = "disconnected" | "idle" | "running" | "complete";

// ─── Score Utilities ─────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 75) return "bg-red-500";
  if (score >= 60) return "bg-orange-400";
  if (score >= 55) return "bg-amber-400";
  if (score >= 45) return "bg-gray-300";
  if (score >= 30) return "bg-blue-300";
  return "bg-blue-500";
}

function getScoreTextColor(score: number): string {
  if (score >= 75) return "text-white";
  if (score >= 60) return "text-white";
  if (score >= 55) return "text-gray-900";
  if (score >= 45) return "text-gray-700";
  return "text-white";
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Hot";
  if (score >= 55) return "Warm";
  if (score >= 45) return "Neutral";
  return "Cold";
}

function getTileBgColor(score: number): string {
  if (score >= 80) return "rgba(239, 68, 68, 0.25)";
  if (score >= 70) return "rgba(249, 115, 22, 0.2)";
  if (score >= 60) return "rgba(245, 158, 11, 0.15)";
  if (score >= 55) return "rgba(245, 158, 11, 0.08)";
  if (score >= 45) return "rgba(156, 163, 175, 0.08)";
  if (score >= 30) return "rgba(59, 130, 246, 0.1)";
  return "rgba(59, 130, 246, 0.2)";
}

function getDeltaArrow(delta: number): string {
  if (delta > 5) return "\u25B2";
  if (delta < -5) return "\u25BC";
  return "\u25C6";
}

function getDeltaColor(delta: number): string {
  if (delta > 5) return "text-red-500";
  if (delta < -5) return "text-blue-500";
  return "text-gray-400";
}

// ─── Component ───────────────────────────────────────────────────────────

export default function SocialHeatmapPage() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [scanState, setScanState] = useState<ScanState>("disconnected");
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, keyword: "" });
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);
  const [isBaseline, setIsBaseline] = useState(true);
  const [totalDays, setTotalDays] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"score" | "delta">("score");
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);
  const [chromeMcpConnected, setChromeMcpConnected] = useState(false);

  // Load existing heatmap data
  const loadHeatmapData = useCallback(async () => {
    try {
      const res = await fetch("/api/heatmap/results");
      if (res.ok) {
        const data = await res.json();
        setKeywords(data.keywords || []);
        setLastScan(data.lastScan || null);
        setIsBaseline(data.isBaseline ?? true);
        setTotalDays(data.totalDays || 0);
        setDataSource(data.source || null);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadHeatmapData();
    // Check Chrome MCP connection
    checkChromeMcp();
  }, [loadHeatmapData]);

  async function checkChromeMcp() {
    // Try to detect Chrome MCP by checking if the extension tools are available
    // The frontend can't directly check — we set connected based on user action
    // For now, always start as disconnected; the "Connect" button enables it
    setChromeMcpConnected(false);
    setScanState("disconnected");
  }

  function enableChromeMcp() {
    setChromeMcpConnected(true);
    setScanState("idle");
  }

  async function runHeatmapScan() {
    if (!chromeMcpConnected || scanState === "running") return;

    setScanState("running");
    setScanProgress({ current: 0, total: HEATMAP_KEYWORDS.length, keyword: "" });

    for (let i = 0; i < HEATMAP_KEYWORDS.length; i++) {
      const kw = HEATMAP_KEYWORDS[i];
      setScanProgress({ current: i + 1, total: HEATMAP_KEYWORDS.length, keyword: kw.keyword });

      try {
        // Navigate to X.com search for this keyword
        // In practice, this would use Chrome MCP to navigate and read the page
        // For now, we send a scan request to the API which handles the logic
        const searchUrl = `https://x.com/search?q=${encodeURIComponent(kw.keyword)}&f=top`;

        // The actual Chrome MCP flow would be:
        // 1. MCP navigates to searchUrl
        // 2. Wait for page load
        // 3. MCP reads view counts from top 3 posts
        // 4. Sum and record
        // Since we can't directly call MCP tools from client JS,
        // we post each keyword result to the record endpoint
        // The Chrome MCP scan is orchestrated externally (e.g. from Claude Code)

        // For manual/local testing: record with estimated views
        // In production, the scan loop is driven by Chrome MCP actions
        await fetch("/api/heatmap/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword: kw.keyword,
            category: kw.category,
            totalViews: 0, // Will be populated by Chrome MCP
            top3Views: [],
            searchUrl,
          }),
        });
      } catch {
        // Skip failed keywords and continue
      }

      // Rate limiting: 3-5 second delay between keywords
      if (i < HEATMAP_KEYWORDS.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }

    setScanState("complete");
    await loadHeatmapData();

    // Revert to idle after 3 seconds
    setTimeout(() => {
      setScanState("idle");
    }, 3000);
  }

  // Filter and sort
  const filtered = selectedCategory === "All"
    ? keywords
    : keywords.filter((k) => k.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "delta") return Math.abs(b.delta) - Math.abs(a.delta);
    return b.heatScore - a.heatScore;
  });

  // Summary stats
  const hotCount = keywords.filter((k) => k.heatScore >= 75).length;
  const warmCount = keywords.filter((k) => k.heatScore >= 55 && k.heatScore < 75).length;
  const coolCount = keywords.filter((k) => k.heatScore < 45).length;
  const avgScore = keywords.length > 0
    ? Math.round(keywords.reduce((sum, k) => sum + k.heatScore, 0) / keywords.length)
    : 50;

  // Run button text
  function getRunButtonText(): string {
    switch (scanState) {
      case "disconnected":
        return "Connect Chrome to scan";
      case "idle":
        return "\u26A1 Run Heatmap";
      case "running":
        return `Scanning: ${scanProgress.keyword} (${scanProgress.current}/${scanProgress.total})`;
      case "complete":
        return "\u2705 Heatmap Updated";
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Social Heatmap</h1>
            <p className="text-xs text-gray-400 mt-1">
              X.com view count analysis — {HEATMAP_KEYWORDS.length} tracked keywords
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!chromeMcpConnected && (
              <button
                onClick={enableChromeMcp}
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Chrome MCP Connected
              </button>
            )}
            <button
              onClick={runHeatmapScan}
              disabled={scanState === "disconnected" || scanState === "running"}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                scanState === "disconnected"
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : scanState === "running"
                  ? "bg-amber-100 text-amber-700 cursor-wait"
                  : scanState === "complete"
                  ? "bg-green-100 text-green-700"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {getRunButtonText()}
            </button>
            {lastScan && (
              <span className="text-xs text-gray-400">
                Last updated: {new Date(lastScan).toLocaleDateString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
                {dataSource === "claude_websearch" && (
                  <span className="ml-1 text-gray-300">&middot; AI sweep</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Scan progress bar */}
        {scanState === "running" && (
          <div className="mb-4">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-500"
                style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Baseline period notice */}
        {isBaseline && totalDays > 0 && (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm text-amber-700">
              Building baseline — {totalDays} day{totalDays !== 1 ? "s" : ""} of data collected. Scores become active after 7 days ({7 - totalDays} remaining).
            </p>
          </div>
        )}

        {/* Chrome MCP disconnected notice */}
        {scanState === "disconnected" && (
          <div className="mb-6 rounded-lg bg-gray-100 border border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Connect Chrome extension and log into X.com to run heatmap scan. Click &quot;Chrome MCP Connected&quot; when ready.
            </p>
          </div>
        )}

        {/* Summary cards */}
        {keywords.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{hotCount}</p>
              <p className="text-xs text-gray-500 mt-1">Hot ({"\u2265"}75)</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{warmCount}</p>
              <p className="text-xs text-gray-500 mt-1">Warm (55–74)</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{coolCount}</p>
              <p className="text-xs text-gray-500 mt-1">Cold (&lt;45)</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-gray-700">{avgScore}</p>
              <p className="text-xs text-gray-500 mt-1">Avg Score</p>
            </div>
          </div>
        )}

        {/* Category filters + sort */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort:</span>
            <button
              onClick={() => setSortBy("score")}
              className={`text-xs font-medium px-2 py-1 rounded ${
                sortBy === "score" ? "bg-gray-200 text-gray-800" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Heat Score
            </button>
            <button
              onClick={() => setSortBy("delta")}
              className={`text-xs font-medium px-2 py-1 rounded ${
                sortBy === "delta" ? "bg-gray-200 text-gray-800" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Biggest Movers
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-[10px] text-gray-500">Surging</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-orange-400" />
            <span className="text-[10px] text-gray-500">Hot</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-amber-400" />
            <span className="text-[10px] text-gray-500">Warm</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-300" />
            <span className="text-[10px] text-gray-500">Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-blue-300" />
            <span className="text-[10px] text-gray-500">Cool</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-[10px] text-gray-500">Cold</span>
          </div>
        </div>

        {/* Main content: grid + detail panel */}
        <div className="flex gap-6">
          {/* Heatmap grid */}
          <div className="flex-1">
            {sorted.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {sorted.map((kw) => (
                  <button
                    key={kw.keyword}
                    onClick={() => setSelectedKeyword(kw)}
                    className={`rounded-lg border p-3 text-left transition-all hover:shadow-md ${
                      selectedKeyword?.keyword === kw.keyword
                        ? "border-gray-900 ring-1 ring-gray-900"
                        : "border-gray-100"
                    }`}
                    style={{
                      backgroundColor: kw.colourHex
                        ? `${kw.colourHex}22`  // 13% opacity tint from the precomputed hex
                        : getTileBgColor(kw.heatScore)
                    }}
                  >
                    <p className="text-sm font-medium text-gray-800 mb-1 truncate">{kw.keyword}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${kw.colourHex ? "" : getScoreColor(kw.heatScore)} ${getScoreTextColor(kw.heatScore)}`}
                        style={kw.colourHex ? { backgroundColor: kw.colourHex } : undefined}
                      >
                        {kw.heatScore}
                      </span>
                      <span className={`text-xs font-semibold ${getDeltaColor(kw.delta)}`}>
                        {getDeltaArrow(kw.delta)} {kw.delta > 0 ? "+" : ""}{kw.delta}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{kw.category}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-400 mb-2">No heatmap data yet</p>
                <p className="text-xs text-gray-300">
                  {chromeMcpConnected
                    ? "Click \"\u26A1 Run Heatmap\" to begin scanning X.com for keyword buzz"
                    : "Connect Chrome extension and log into X.com to start scanning"}
                </p>
                <div className="mt-8">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">
                    Tracked Keywords ({HEATMAP_KEYWORDS.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                    {HEATMAP_KEYWORDS.map((kw) => (
                      <span key={kw.keyword} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                        {kw.keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedKeyword && (
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">{selectedKeyword.keyword}</h3>
                  <button
                    onClick={() => setSelectedKeyword(null)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {"\u2715"}
                  </button>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${getScoreColor(selectedKeyword.heatScore)} ${getScoreTextColor(selectedKeyword.heatScore)}`}>
                    {selectedKeyword.heatScore}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getScoreLabel(selectedKeyword.heatScore)}</p>
                    <p className={`text-xs font-semibold ${getDeltaColor(selectedKeyword.delta)}`}>
                      {getDeltaArrow(selectedKeyword.delta)} {selectedKeyword.delta > 0 ? "+" : ""}{selectedKeyword.delta} vs 7 days ago
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Category</dt>
                    <dd className="text-gray-900 font-medium">{selectedKeyword.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total Views (Top 3)</dt>
                    <dd className="text-gray-900 font-mono">{selectedKeyword.totalViews.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">7-Day Avg</dt>
                    <dd className="text-gray-900 font-mono">{selectedKeyword.sevenDayAvg.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Trend</dt>
                    <dd className={`font-medium capitalize ${
                      selectedKeyword.trend === "heating" ? "text-red-600" :
                      selectedKeyword.trend === "cooling" ? "text-blue-600" :
                      "text-gray-600"
                    }`}>
                      {selectedKeyword.trend}
                    </dd>
                  </div>
                </dl>

                {/* Top 3 view counts */}
                {selectedKeyword.top3Views && selectedKeyword.top3Views.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Top 3 Post Views</h4>
                    <div className="space-y-1">
                      {selectedKeyword.top3Views.map((views: number, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-4">#{i + 1}</span>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-400 rounded-full"
                              style={{
                                width: `${Math.min(100, (views / Math.max(...selectedKeyword.top3Views)) * 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 font-mono w-16 text-right">
                            {views.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Score formula explanation */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400">
                    Score = 50 + (ratio − 1) × 45, where ratio = today&apos;s views ÷ 7-day avg.
                    Score 50 = average. {"\u2265"}75 = Hot. &lt;45 = Cold.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
