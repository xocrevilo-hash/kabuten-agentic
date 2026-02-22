"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ── Types ──

interface AgentCompany {
  id: string;
  name: string;
  ticker: string;
  stance: string;
  conviction: string;
}

interface AgentStatus {
  sector_key: string;
  designation: string;
  name: string;
  colour: string;
  company_count: number;
  bullish: number;
  neutral: number;
  bearish: number;
  message_count: number;
  last_sweep_at: string | null;
  last_updated: string | null;
  posture: string | null;
  conviction: number | null;
  companies: AgentCompany[];
}

interface SectorViewData {
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

interface SectorLogEntry {
  id: number;
  logDate: string;
  classification: string;
  summary: string;
  relatedCompanies: string[];
  createdAt: string;
}

interface ThreadMessage {
  role: string;
  type: string;
  timestamp: string;
  content?: string;
  summary?: string;
  classification?: string;
  company_results?: Array<{ company_name: string; severity: string; summary: string }>;
  findings?: Array<{ ticker: string; company_name: string; finding_type: string; headline: string; signal: string; category: string; assessment: string }>;
}

// ── Helpers ──

function formatDate(dateStr: string | null) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "\u2014";
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

function classificationBadge(classification: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    MATERIAL: { bg: "bg-amber-100 border-amber-300", text: "text-amber-800", label: "MATERIAL" },
    INCREMENTAL: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "INCREMENTAL" },
    NO_CHANGE: { bg: "bg-gray-50 border-gray-200", text: "text-gray-500", label: "NO CHANGE" },
  };
  const m = map[classification] || map.NO_CHANGE;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
}

function stanceBadge(stance: string, small = false) {
  const styles: Record<string, string> = {
    bullish: "bg-green-50 text-green-700 border-green-200",
    bearish: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const sz = small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return (
    <span className={`inline-flex items-center rounded-full font-semibold border capitalize ${sz} ${styles[stance] || styles.neutral}`}>
      {stance === "bullish" && "\u2191 "}
      {stance === "bearish" && "\u2193 "}
      {stance === "neutral" && "\u2192 "}
      {stance}
    </span>
  );
}

function convictionStars(conviction: string | number | null) {
  let level = 2;
  if (typeof conviction === "number") {
    level = conviction >= 7 ? 3 : conviction >= 4 ? 2 : 1;
  } else if (typeof conviction === "string") {
    level = { low: 1, medium: 2, high: 3 }[conviction] || 2;
  }
  return (
    <span className="text-sm">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= level ? "text-gray-800" : "text-gray-300"}>&#9733;</span>
      ))}
    </span>
  );
}

// ── Main Component ──

export default function SectorsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Feed data
  const [sectorView, setSectorView] = useState<SectorViewData | null>(null);
  const [sectorLog, setSectorLog] = useState<SectorLogEntry[]>([]);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  // Right panel tab
  const [rightTab, setRightTab] = useState<"agent" | "sector" | "coverage">("agent");

  // Chat
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Mobile state
  const [mobileTab, setMobileTab] = useState<"feed" | "agent" | "coverage">("feed");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAllSweep, setShowAllSweep] = useState(false);

  // Load agents on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/agents/status");
        const data = await res.json();
        if (data.agents?.length > 0) {
          setAgents(data.agents);
          setActiveKey(data.agents[0].sector_key);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Load feed data for active sector
  const loadFeed = useCallback(async (key: string) => {
    setFeedLoading(true);
    try {
      const agent = agents.find((a) => a.sector_key === key);
      if (!agent) return;

      // Fetch sector detail (view + log) and thread in parallel
      const sectorNameMap: Record<string, string> = {
        au_enterprise_software: "Australia Enterprise Software",
        china_digital_consumption: "China Digital Consumption",
        dc_power_cooling: "Data-centre Power & Cooling",
        india_it_services: "India IT Services",
        memory_semis: "Memory Semiconductors",
        networking_optics: "Networking & Optics",
        semi_equipment: "Semiconductor Production Equipment",
      };
      const sectorName = sectorNameMap[key] || agent.name;

      const [sectorRes] = await Promise.all([
        fetch(`/api/sectors?sector=${encodeURIComponent(sectorName)}`),
      ]);

      const sectorData = await sectorRes.json();
      const sector = sectorData.sectors?.[0];

      if (sector) {
        setSectorView(sector.sectorView || null);
        setSectorLog(sector.log || []);
      }

      // Load thread history from agent status (it's in the thread table)
      // We'll parse from agent status or separate endpoint
      setThreadMessages([]);
    } catch {
      // Silent fail
    } finally {
      setFeedLoading(false);
    }
  }, [agents]);

  useEffect(() => {
    if (activeKey && agents.length > 0) {
      loadFeed(activeKey);
    }
  }, [activeKey, agents, loadFeed]);

  // Chat send
  const handleSend = async () => {
    if (!chatInput.trim() || chatSending) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatSending(true);

    // Optimistically add PM message
    const pmMsg: ThreadMessage = {
      role: "user",
      type: "pm_message",
      timestamp: new Date().toISOString(),
      content: msg,
    };
    setThreadMessages((prev) => [...prev, pmMsg]);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector_key: activeKey, message: msg }),
      });
      const data = await res.json();

      const agentReply: ThreadMessage = {
        role: "assistant",
        type: "agent_response",
        timestamp: new Date().toISOString(),
        content: data.reply || "No response.",
      };
      setThreadMessages((prev) => [...prev, agentReply]);
    } catch {
      const errMsg: ThreadMessage = {
        role: "assistant",
        type: "agent_response",
        timestamp: new Date().toISOString(),
        content: "Failed to get response. Please try again.",
      };
      setThreadMessages((prev) => [...prev, errMsg]);
    } finally {
      setChatSending(false);
      setTimeout(() => feedEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const active = agents.find((a) => a.sector_key === activeKey);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading sector agents...</div>
      </div>
    );
  }

  // ── Shared sub-components ──

  const StatsBar = ({ agent, compact = false }: { agent: AgentStatus; compact?: boolean }) => (
    <div className={`flex ${compact ? "gap-2 overflow-x-auto pb-1" : "gap-3"}`}>
      {[
        { label: "Companies", value: agent.company_count, color: "text-gray-900" },
        { label: "Bullish", value: agent.bullish, color: "text-green-600" },
        { label: "Neutral", value: agent.neutral, color: "text-amber-600" },
        { label: "Bearish", value: agent.bearish, color: "text-red-600" },
      ].map((stat) => (
        <div
          key={stat.label}
          className={`${compact ? "flex items-center gap-1 px-2 py-1 bg-white rounded-full text-[11px] whitespace-nowrap" : "px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-center"}`}
        >
          <span className={`font-bold ${stat.color} ${compact ? "" : "text-lg block"}`}>{stat.value}</span>
          <span className="text-gray-500 text-[10px]">{compact ? stat.label : ""}</span>
          {!compact && <div className="text-[10px] text-gray-500">{stat.label}</div>}
        </div>
      ))}
    </div>
  );

  const AgentPanel = ({ agent }: { agent: AgentStatus }) => (
    <div className="space-y-4">
      {/* Agent identity */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: agent.colour }}
        >
          {agent.designation.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{agent.designation}</div>
          <div className="text-xs text-gray-500">{agent.name}</div>
        </div>
      </div>

      {/* Last sweep */}
      <div className="text-xs text-gray-400">
        Last sweep: {formatDateTime(agent.last_sweep_at)}
      </div>

      {/* Posture + conviction */}
      {agent.posture && (
        <div className="flex items-center gap-2">
          {stanceBadge(agent.posture)}
          {convictionStars(agent.conviction)}
        </div>
      )}

      {/* Sector View detail */}
      {sectorView && (
        <>
          <div>
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Thesis</h4>
            <p className="text-xs text-gray-700 leading-relaxed">{sectorView.thesisSummary}</p>
          </div>

          {sectorView.keyDrivers?.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Key Drivers</h4>
              <ul className="space-y-0.5">
                {sectorView.keyDrivers.slice(0, 3).map((d, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>{d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sectorView.keyRisks?.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Key Risks</h4>
              <ul className="space-y-0.5">
                {sectorView.keyRisks.slice(0, 3).map((r, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">&ndash;</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Message count */}
      <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">
        {agent.message_count} messages in thread
      </div>
    </div>
  );

  const CoveragePanel = ({ agent }: { agent: AgentStatus }) => (
    <div className="space-y-2">
      <StatsBar agent={agent} compact />
      <div className="space-y-1">
        {agent.companies.map((c) => (
          <Link
            key={c.id}
            href={`/company/${c.id}`}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            <div>
              <div className="text-sm font-medium text-gray-900">{c.name}</div>
              <div className="text-[10px] text-gray-400 font-mono">{c.ticker}</div>
            </div>
            {stanceBadge(c.stance, true)}
          </Link>
        ))}
      </div>
    </div>
  );

  // Build feed items from log entries and thread messages
  const feedItems: Array<{ key: string; type: string; timestamp: string; content: React.ReactNode }> = [];

  // Add sector log entries
  for (const entry of sectorLog) {
    feedItems.push({
      key: `log-${entry.id}`,
      type: entry.classification,
      timestamp: entry.createdAt || entry.logDate,
      content: (
        <div className={`rounded-lg border bg-white p-4 ${entry.classification === "MATERIAL" ? "border-l-4 border-l-amber-400" : "border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {classificationBadge(entry.classification)}
            <span className="text-[10px] text-gray-400 font-mono">{formatDate(entry.logDate || entry.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-800">{entry.summary}</p>
          {entry.relatedCompanies?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {entry.relatedCompanies.map((c, i) => (
                <span key={i} className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{c}</span>
              ))}
            </div>
          )}
        </div>
      ),
    });
  }

  // Add thread messages (PM + agent responses)
  for (const msg of threadMessages) {
    if (msg.type === "pm_message") {
      feedItems.push({
        key: `pm-${msg.timestamp}`,
        type: "pm",
        timestamp: msg.timestamp,
        content: (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg bg-gray-900 text-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 font-semibold">PM</span>
                <span className="text-[10px] text-gray-400 font-mono">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ),
      });
    } else if (msg.type === "agent_response") {
      feedItems.push({
        key: `agent-${msg.timestamp}`,
        type: "agent",
        timestamp: msg.timestamp,
        content: (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg border border-green-200 bg-green-50/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded text-white font-semibold"
                  style={{ backgroundColor: active?.colour || "#10b981" }}
                >
                  {active?.designation || "AGENT"}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ),
      });
    }
  }

  // Sort by timestamp
  feedItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // For mobile feed: filter sweep items
  const mobileFeedItems = showAllSweep
    ? feedItems
    : feedItems.filter((item) => item.type !== "NO_CHANGE");

  // ── Render ──

  return (
    <div className="min-h-screen">
      {/* ── DESKTOP LAYOUT (>768px) ── */}
      <div className="hidden md:flex h-[calc(100vh-52px)]">
        {/* LEFT SIDEBAR */}
        <div className="w-[230px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
          {/* Brand */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">K<span className="text-gray-500">&#26666;</span></span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Sector Agent</span>
            </div>
          </div>

          {/* Sector channels */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-3 mb-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Sectors</span>
            </div>
            {agents.map((agent) => {
              const isActive = agent.sector_key === activeKey;
              return (
                <button
                  key={agent.sector_key}
                  onClick={() => setActiveKey(agent.sector_key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    isActive
                      ? "bg-gray-100 border-l-2 border-l-gray-900"
                      : "hover:bg-gray-50 border-l-2 border-l-transparent"
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: agent.colour }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                      {agent.designation}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{agent.name}</div>
                  </div>
                  <span className="text-[10px] text-gray-400">{agent.company_count}</span>
                </button>
              );
            })}
          </div>

          {/* PM footer */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600 font-medium">PM Online</span>
          </div>
        </div>

        {/* CENTRE FEED */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f4f5f7]">
          {/* Channel header */}
          {active && (
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: active.colour }}
              >
                {active.designation.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {active.designation} &middot; {active.name}
                </div>
                <div className="text-[10px] text-gray-400">
                  {active.company_count} companies &middot; Last sweep: {formatDate(active.last_sweep_at)}
                </div>
              </div>
            </div>
          )}

          {/* Stats bar */}
          {active && (
            <div className="px-4 py-2 bg-white/80 border-b border-gray-100">
              <StatsBar agent={active} />
            </div>
          )}

          {/* Message feed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {feedLoading ? (
              <div className="text-sm text-gray-400 text-center py-8">Loading feed...</div>
            ) : feedItems.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                No messages yet. The sector agent will populate this feed after the next daily sweep.
              </div>
            ) : (
              feedItems.map((item) => (
                <div key={item.key}>{item.content}</div>
              ))
            )}
            <div ref={feedEndRef} />
          </div>

          {/* Composer */}
          <div className="px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-end gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Ask ${active?.designation || "agent"}...`}
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent min-h-[38px] max-h-[120px]"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={chatSending || !chatInput.trim()}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {chatSending ? "..." : "Send"}
              </button>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              Enter sends &middot; Shift+Enter for newline
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[270px] border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(["agent", "sector", "coverage"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 px-2 py-2.5 text-xs font-medium capitalize transition-colors ${
                  rightTab === tab
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "sector" ? "Sector View" : tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {active && rightTab === "agent" && <AgentPanel agent={active} />}

            {rightTab === "sector" && sectorView && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {stanceBadge(sectorView.stance)}
                  {convictionStars(sectorView.conviction)}
                </div>

                <div>
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Thesis</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">{sectorView.thesisSummary}</p>
                </div>

                {sectorView.valuationAssessment?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Valuation</h4>
                    <ul className="space-y-0.5">
                      {sectorView.valuationAssessment.slice(0, 4).map((v, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                          <span className="text-blue-500 mt-0.5 flex-shrink-0">&#9679;</span>{v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sectorView.convictionRationale?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Conviction Rationale</h4>
                    <ul className="space-y-0.5">
                      {sectorView.convictionRationale.slice(0, 4).map((c, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                          <span className="text-gray-400 mt-0.5 flex-shrink-0">&#8227;</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                  Updated: {formatDateTime(sectorView.lastUpdated)}
                  {sectorView.lastUpdatedReason && (
                    <div className="mt-0.5">Trigger: {sectorView.lastUpdatedReason}</div>
                  )}
                </div>
              </div>
            )}

            {rightTab === "sector" && !sectorView && (
              <div className="text-xs text-gray-400 text-center py-8">
                No sector view yet. Will be generated after the next sweep.
              </div>
            )}

            {active && rightTab === "coverage" && <CoveragePanel agent={active} />}
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT (<=768px) ── */}
      <div className="md:hidden flex flex-col h-[calc(100vh-52px)]">
        {/* Sector drawer overlay */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative w-72 bg-white h-full shadow-xl overflow-y-auto animate-slide-in-left">
              <div className="px-4 py-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-900">Sector Channels</span>
              </div>
              {agents.map((agent) => (
                <button
                  key={agent.sector_key}
                  onClick={() => {
                    setActiveKey(agent.sector_key);
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left min-h-[44px] ${
                    agent.sector_key === activeKey ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: agent.colour }} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{agent.designation}</div>
                    <div className="text-xs text-gray-500">{agent.name}</div>
                  </div>
                  <span className="text-xs text-gray-400">{agent.company_count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Top bar */}
        {active && (
          <div className="flex items-center px-3 py-2.5 bg-white border-b border-gray-200 min-h-[44px]">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <span className="text-sm font-semibold text-gray-900">
                {active.designation} &middot; {active.name}
              </span>
            </div>
            <div className="w-[44px]" /> {/* Spacer for centering */}
          </div>
        )}

        {/* Stats bar (mobile — compact scrollable) */}
        {active && mobileTab === "feed" && (
          <div className="px-3 py-1.5 bg-white/80 border-b border-gray-100 overflow-x-auto">
            <StatsBar agent={active} compact />
          </div>
        )}

        {/* Active pane content */}
        <div className="flex-1 overflow-y-auto bg-[#f4f5f7]">
          {/* FEED TAB */}
          {mobileTab === "feed" && (
            <div className="px-3 py-3 space-y-2">
              {feedLoading ? (
                <div className="text-sm text-gray-400 text-center py-8">Loading...</div>
              ) : mobileFeedItems.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-8">No feed items yet.</div>
              ) : (
                <>
                  {!showAllSweep && feedItems.length > mobileFeedItems.length && (
                    <button
                      onClick={() => setShowAllSweep(true)}
                      className="w-full text-center text-xs text-blue-600 py-2 min-h-[44px]"
                    >
                      Show all {feedItems.length} entries
                    </button>
                  )}
                  {mobileFeedItems.map((item) => (
                    <div key={item.key}>{item.content}</div>
                  ))}
                </>
              )}
              <div ref={feedEndRef} />
            </div>
          )}

          {/* AGENT TAB */}
          {mobileTab === "agent" && active && (
            <div className="p-4">
              <AgentPanel agent={active} />
            </div>
          )}

          {/* COVERAGE TAB */}
          {mobileTab === "coverage" && active && (
            <div className="p-3">
              <CoveragePanel agent={active} />
            </div>
          )}
        </div>

        {/* Composer (above bottom nav) */}
        <div className="px-3 py-2 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask ${active?.designation || "agent"}...`}
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[44px]"
            />
            <button
              onClick={handleSend}
              disabled={chatSending || !chatInput.trim()}
              className="w-[44px] h-[44px] rounded-full bg-gray-900 text-white flex items-center justify-center disabled:opacity-40 transition-colors"
            >
              {chatSending ? "..." : "\u27A4"}
            </button>
          </div>
        </div>

        {/* Bottom tab bar */}
        <div className="flex bg-white border-t border-gray-200">
          {([
            { key: "feed" as const, icon: "\uD83D\uDCAC", label: "Feed" },
            { key: "agent" as const, icon: "\uD83E\uDD16", label: "Agent" },
            { key: "coverage" as const, icon: "\uD83D\uDCCB", label: "Coverage" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={`flex-1 flex flex-col items-center py-2 min-h-[50px] transition-colors ${
                mobileTab === tab.key
                  ? "text-gray-900"
                  : "text-gray-400"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
