"use client";

import { useState, useEffect } from "react";

interface PodcastEpisode {
  id: number;
  podcast_name: string;
  episode_title: string;
  episode_date: string;
  insights_json?: { topic: string; insight: string }[];
  status?: string;
  processed_at?: string;
}

const TRACKED_PODCASTS = [
  { name: "a16z", label: "a16z Podcast", focus: "Tech, venture, AI" },
  { name: "all-in", label: "All-In", focus: "Tech, venture, macro" },
  { name: "bg2", label: "BG2 Pod", focus: "Business, growth, tech" },
  { name: "big-tech", label: "Big Technology Podcast", focus: "Big tech industry" },
  { name: "bloomberg-tech", label: "Bloomberg Technology", focus: "Tech news, markets" },
  { name: "dwarkesh", label: "Dwarkesh Podcast", focus: "AI, technology, science" },
  { name: "excess-returns", label: "Excess Returns", focus: "Investing, markets" },
  { name: "hard-fork", label: "Hard Fork (NYT)", focus: "Tech culture, AI" },
  { name: "no-priors", label: "No Priors", focus: "AI, machine learning" },
  { name: "odd-lots", label: "Odd Lots (Bloomberg)", focus: "Markets, economics, tech" },
  { name: "semi-doped", label: "Semi Doped", focus: "Semiconductors, chip industry" },
];

const PODCAST_LABEL_MAP: Record<string, string> = Object.fromEntries(
  TRACKED_PODCASTS.map((p) => [p.name, p.label])
);

function StatusIndicator({ status }: { status?: string }) {
  switch (status) {
    case "full":
      return <span className="text-green-500" title="Full transcript analysed">{"\u2705"}</span>;
    case "partial":
      return <span className="text-amber-500" title="Partial — used description + web search">{"\uD83D\uDFE1"}</span>;
    case "not_found":
      return <span className="text-red-500" title="Episode not found">{"\u274C"}</span>;
    case "pending":
      return <span className="text-gray-400" title="Scan in progress">{"\u23F3"}</span>;
    default:
      return <span className="text-gray-300">{"\u2014"}</span>;
  }
}

export default function PodcastTrackerPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEpisodes();
  }, []);

  async function loadEpisodes() {
    try {
      const res = await fetch("/api/podcasts");
      if (res.ok) {
        const data = await res.json();
        setEpisodes(data.episodes || []);
        if (data.lastScan) setLastScan(data.lastScan);
      }
    } catch {
      // ignore
    }
  }

  async function runScan() {
    setScanning(true);
    setScanProgress("Starting podcast scan...");
    try {
      const res = await fetch("/api/podcasts/run", { method: "POST" });
      if (res.ok) {
        setScanProgress("Podcast scan complete");
        setLastScan(new Date().toISOString());
        await loadEpisodes();
      } else {
        setScanProgress("Scan failed \u2014 check logs");
      }
    } catch {
      setScanProgress("Connection error");
    } finally {
      setScanning(false);
    }
  }

  // Filter episodes
  const filteredEpisodes = search
    ? episodes.filter(
        (e) =>
          e.episode_title?.toLowerCase().includes(search.toLowerCase()) ||
          e.podcast_name?.toLowerCase().includes(search.toLowerCase()) ||
          (PODCAST_LABEL_MAP[e.podcast_name] || "").toLowerCase().includes(search.toLowerCase()) ||
          e.insights_json?.some((ins) =>
            ins.insight.toLowerCase().includes(search.toLowerCase()) ||
            ins.topic.toLowerCase().includes(search.toLowerCase())
          )
      )
    : episodes;

  // Sort newest first by episode_date (then by processed_at as fallback)
  const sortedEpisodes = [...filteredEpisodes].sort((a, b) => {
    const dateA = a.episode_date ? new Date(a.episode_date).getTime() : 0;
    const dateB = b.episode_date ? new Date(b.episode_date).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;
    const procA = a.processed_at ? new Date(a.processed_at).getTime() : 0;
    const procB = b.processed_at ? new Date(b.processed_at).getTime() : 0;
    return procB - procA;
  });

  return (
    <div className="min-h-screen">
      {/* Frozen header */}
      <div className="sticky top-10 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-900">Podcast Tracker</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={runScan}
                disabled={scanning}
                className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scanning ? scanProgress : "Run Podcast Scan"}
              </button>
              {lastScan && (
                <span className="text-xs text-gray-400">
                  Last: {new Date(lastScan).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter podcasts & insights..."
            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-300 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Podcasts Tracked reference table \u2014 top-left */}
        <div className="mb-6 max-w-sm">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Podcasts Tracked ({TRACKED_PODCASTS.length})</h2>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {TRACKED_PODCASTS.map((p, i) => (
                  <tr key={p.name} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-1.5 text-gray-400 text-xs font-mono w-6">{i + 1}</td>
                    <td className="py-1.5 text-gray-900 text-sm font-medium">{p.label}</td>
                    <td className="px-4 py-1.5 text-gray-400 text-xs text-right">{p.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fully expanded sequential log \u2014 newest first */}
        <div className="space-y-4">
          {sortedEpisodes.length > 0 ? (
            sortedEpisodes.map((episode) => (
              <div key={episode.id} className="rounded-xl border border-gray-200 bg-white p-5">
                {/* Episode header */}
                <div className="flex items-center gap-3 mb-2">
                  <StatusIndicator status={episode.status} />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {PODCAST_LABEL_MAP[episode.podcast_name] || episode.podcast_name}
                  </span>
                  {episode.episode_date && (
                    <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{episode.episode_date}</span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">{episode.episode_title}</h3>

                {/* Insights \u2014 always expanded */}
                {episode.insights_json && episode.insights_json.length > 0 ? (
                  <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                    {episode.insights_json.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                          {insight.topic}
                        </span>
                        <p className="text-sm text-gray-700">{insight.insight}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No insights extracted</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-2">No podcast summaries yet</p>
              <p className="text-xs text-gray-300">Click &quot;Run Podcast Scan&quot; to fetch and analyze latest episodes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
