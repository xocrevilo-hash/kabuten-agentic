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
  unread_count: number;
  last_sweep_at: string | null;
  last_updated: string | null;
  last_read_at: string | null;
  posture: string | null;
  conviction: number | null;
  companies: AgentCompany[];
  thread_history: ThreadMessage[];
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
  image_url?: string;
  summary?: string;
  classification?: string;
  company_results?: Array<{ company_name: string; severity: string; summary: string }>;
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

  // Image attach state
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ref to avoid stale closures in loadFeed without causing infinite re-renders
  const agentsRef = useRef<AgentStatus[]>([]);
  agentsRef.current = agents;

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Sweep dropdown state — track which sweep cards are expanded
  const [expandedSweeps, setExpandedSweeps] = useState<Set<string>>(new Set());
  const toggleSweep = useCallback((key: string) => {
    setExpandedSweeps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Mobile state
  const [mobileTab, setMobileTab] = useState<"feed" | "agent" | "coverage">("feed");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAllSweep, setShowAllSweep] = useState(false);

  // Load agent list on mount (without full thread histories — those load on demand)
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

  // Load feed data for active sector ON DEMAND from Postgres
  const loadFeed = useCallback(async (key: string) => {
    setFeedLoading(true);
    try {
      const agent = agentsRef.current.find((a) => a.sector_key === key);
      if (!agent) return;

      const sectorNameMap: Record<string, string> = {
        au_enterprise_software: "Australia Enterprise Software",
        china_digital_consumption: "China Digital Consumption",
        dc_power_cooling: "Data-centre Power & Cooling",
        india_it_services: "India IT Services",
        memory_semis: "Memory Semiconductors",
        networking_optics: "Networking & Optics",
        semi_equipment: "Semiconductor Production Equipment",
        ev_supply_chain: "EV Supply-chain",
        china_ai_apps: "China AI Apps",
        china_semis: "China Semis",
        japan_materials: "Japan Materials",
        gaming: "Gaming",
        pcb_supply_chain: "PCB Supply-chain",
        asean_ecommerce: "ASEAN E-commerce",
        ai_semis: "AI Semis",
        mlccs: "MLCCs",
        server_odms: "Server ODMs",
      };
      const sectorName = sectorNameMap[key] || agent.name;

      // Fetch sector view/log AND this sector's thread from Postgres in parallel
      const [sectorRes, threadRes] = await Promise.all([
        fetch(`/api/sectors?sector=${encodeURIComponent(sectorName)}`),
        fetch(`/api/agents/status?sector_key=${key}`),
      ]);

      const sectorData = await sectorRes.json();
      const sector = sectorData.sectors?.[0];
      if (sector) {
        setSectorView(sector.sectorView || null);
        setSectorLog(sector.log || []);
      }

      // Hydrate thread messages from Postgres (source of truth)
      const threadData = await threadRes.json();
      const agentData = threadData.agents?.[0];
      if (agentData?.thread_history) {
        setThreadMessages(agentData.thread_history as ThreadMessage[]);
      } else {
        setThreadMessages([]);
      }
    } catch {
      // Silent fail
    } finally {
      setFeedLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark sector as read and load feed when switching sectors
  useEffect(() => {
    if (activeKey && agents.length > 0) {
      loadFeed(activeKey);
      // Mark as read — fire-and-forget
      fetch("/api/agents/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector_key: activeKey }),
      }).catch(() => {});
      // Clear unread count locally
      setAgents((prev) =>
        prev.map((a) => a.sector_key === activeKey ? { ...a, unread_count: 0 } : a)
      );
    }
  }, [activeKey, agents.length, loadFeed]);

  // Handle image attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearAttachment = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Chat send (with optional image) — persists to Postgres via /api/agents/chat
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSend = useCallback(async () => {
    if ((!chatInput.trim() && !attachedImage) || chatSending) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatSending(true);

    let imageUrl: string | undefined;

    // Upload image if attached
    if (attachedImage) {
      try {
        const formData = new FormData();
        formData.append("file", attachedImage);
        const uploadRes = await fetch("/api/agents/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      } catch {
        imageUrl = imagePreview || undefined;
      }
      clearAttachment();
    }

    // Optimistically add OC message to feed
    const ocMsg: ThreadMessage = {
      role: "user",
      type: "oc_message",
      timestamp: new Date().toISOString(),
      content: msg || "",
      image_url: imageUrl,
    };
    setThreadMessages((prev) => [...prev, ocMsg]);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector_key: activeKey,
          message: msg || "",
          image_url: imageUrl,
        }),
      });
      const data = await res.json();

      // Replace optimistic messages with the full persisted thread from DB
      if (data.thread_history) {
        setThreadMessages(data.thread_history as ThreadMessage[]);
      } else {
        // Fallback: just append the reply
        const agentReply: ThreadMessage = {
          role: "assistant",
          type: "agent_response",
          timestamp: new Date().toISOString(),
          content: data.reply || "No response.",
        };
        setThreadMessages((prev) => [...prev, agentReply]);
      }
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
  }, [chatInput, attachedImage, chatSending, activeKey, imagePreview, clearAttachment]);

  // ── Composer — Enter sends, Shift+Enter newline, all other keys normal ──
  // MUST be before the early return to keep hook count consistent across renders
  const handleComposerKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // All other keys: do nothing — let the browser handle normal text input
  }, [handleSend]);

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
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: agent.colour }}
        >
          {agent.designation.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{agent.designation}</div>
          <div className="text-[11px] text-gray-400">{agent.name}</div>
          <div className="text-[10px] text-gray-500">Senior Analyst</div>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        Last sweep: {formatDateTime(agent.last_sweep_at)}
      </div>

      {agent.posture && (
        <div className="flex items-center gap-2">
          {stanceBadge(agent.posture)}
          {convictionStars(agent.conviction)}
        </div>
      )}

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

  // ── Inline image renderer ──
  const InlineImage = ({ url }: { url: string }) => (
    <button onClick={() => setLightboxUrl(url)} className="block mt-1 cursor-zoom-in">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Attached" className="rounded-lg max-h-[320px] w-auto object-contain border border-gray-200" />
    </button>
  );

  // ── Build feed items ──
  const feedItems: Array<{ key: string; type: string; timestamp: string; content: React.ReactNode }> = [];

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

  for (let idx = 0; idx < threadMessages.length; idx++) {
    const msg = threadMessages[idx];
    if (msg.type === "oc_message" || msg.type === "pm_message") {
      feedItems.push({
        key: `oc-${idx}-${msg.timestamp}`,
        type: "oc",
        timestamp: msg.timestamp,
        content: (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg bg-gray-900 text-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 font-semibold">OC</span>
                <span className="text-[10px] text-gray-400 font-mono">{formatTime(msg.timestamp)}</span>
              </div>
              {msg.image_url && <InlineImage url={msg.image_url} />}
              {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
            </div>
          </div>
        ),
      });
    } else if (msg.type === "agent_response") {
      feedItems.push({
        key: `agent-${idx}-${msg.timestamp}`,
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
    } else if (msg.type === "sweep") {
      const sweepKey = `sweep-${idx}-${msg.timestamp}`;
      const results = msg.company_results || [];
      const matCount = results.filter((r) => r.severity === "material" || r.severity === "MATERIAL").length;
      const incrCount = results.filter((r) => r.severity === "incremental" || r.severity === "INCREMENTAL").length;
      const ncCount = results.filter((r) => r.severity === "no_change" || r.severity === "NO_CHANGE" || r.severity === "none").length;
      const isExpanded = expandedSweeps.has(sweepKey);

      feedItems.push({
        key: sweepKey,
        type: "sweep",
        timestamp: msg.timestamp,
        content: (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSweep(sweepKey)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className={`text-[10px] text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}>&#9654;</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">SWEEP</span>
              <span className="text-[10px] text-gray-400 font-mono">{formatDate(msg.timestamp)}</span>
              <span className="text-[10px] text-gray-500 ml-auto">{active?.name}</span>
              <div className="flex gap-1 ml-2">
                {matCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">{matCount} MAT</span>}
                {incrCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 font-semibold">{incrCount} INCR</span>}
                {ncCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200 font-semibold">{ncCount} NC</span>}
                {results.length === 0 && <span className="text-[10px] text-gray-400">Processed</span>}
              </div>
            </button>
            {isExpanded && results.length > 0 && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {results.map((r, ri) => {
                  const sev = (r.severity || "").toUpperCase();
                  const badgeStyle =
                    sev === "MATERIAL" ? "bg-amber-100 border-amber-300 text-amber-800" :
                    sev === "INCREMENTAL" ? "bg-blue-50 border-blue-200 text-blue-700" :
                    "bg-gray-50 border-gray-200 text-gray-500";
                  const badgeLabel = sev === "MATERIAL" ? "MATERIAL" : sev === "INCREMENTAL" ? "INCREMENTAL" : "NO CHG";
                  return (
                    <div key={ri} className="flex items-start gap-2 px-3 py-2 text-xs">
                      <span className="text-gray-700 font-mono font-medium min-w-[60px]">{r.company_name}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 ${badgeStyle}`}>{badgeLabel}</span>
                      <span className="text-gray-600 flex-1">
                        {(sev === "MATERIAL" || sev === "INCREMENTAL") ? r.summary : "No material change"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {isExpanded && results.length === 0 && (
              <div className="border-t border-gray-100 px-3 py-2">
                <p className="text-xs text-gray-500">{msg.summary || "Daily sweep processed."}</p>
              </div>
            )}
          </div>
        ),
      });
    }
  }

  feedItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const mobileFeedItems = showAllSweep
    ? feedItems
    : feedItems.filter((item) => item.type !== "NO_CHANGE");

  // Hidden file input — fully isolated from composer event chain
  const FileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      onChange={(e) => { handleFileSelect(e); e.target.blur(); }}
      className="hidden"
      tabIndex={-1}
      aria-hidden="true"
    />
  );

  const Composer = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? "px-3 py-2" : "px-4 py-3"} bg-white border-t border-gray-200`}>
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="Preview" className="h-16 rounded-lg border border-gray-200" />
          <button
            onClick={clearAttachment}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white rounded-full text-xs flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
          className={`${mobile ? "w-[44px] h-[44px]" : "px-2 py-2"} flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0`}
          title="Attach image"
          tabIndex={-1}
        >
          &#x1F4CE;
        </button>
        {mobile ? (
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder={`Ask ${active?.designation || "agent"}...`}
            className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[44px]"
          />
        ) : (
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder={`Ask ${active?.designation || "agent"}...`}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent min-h-[38px] max-h-[120px]"
            rows={1}
          />
        )}
        <button
          type="button"
          onClick={handleSend}
          disabled={chatSending || (!chatInput.trim() && !attachedImage)}
          className={`${mobile ? "w-[44px] h-[44px] rounded-full" : "px-4 py-2 rounded-lg"} bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0`}
        >
          {chatSending ? "..." : mobile ? "\u27A4" : "Send"}
        </button>
      </div>
      {!mobile && (
        <div className="text-[10px] text-gray-400 mt-1">
          Enter sends &middot; Shift+Enter for newline &middot; &#x1F4CE; attach image
        </div>
      )}
    </div>
  );

  // ── Render ──

  return (
    <div className="min-h-screen">
      {FileInput}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}

      {/* ── DESKTOP LAYOUT (>768px) ── */}
      <div className="hidden md:flex h-[calc(100vh-52px)]">
        {/* LEFT SIDEBAR — 200px */}
        <div className="w-[200px] border-r border-gray-200 bg-[#f4f5f7] flex flex-col flex-shrink-0">
          <div className="px-3 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">K<span className="text-gray-500">&#26666;</span></span>
              <span className="text-[10px] text-gray-900 uppercase tracking-widest font-semibold">Sector Agent</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-3 mb-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Sectors</span>
            </div>
            {agents.map((agent) => {
              const isActive = agent.sector_key === activeKey;
              return (
                <button
                  key={agent.sector_key}
                  onClick={() => setActiveKey(agent.sector_key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                    isActive
                      ? "bg-[#eef0f5] border-l-2 border-l-[#1e3a5f]"
                      : "hover:bg-white/60 border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: agent.colour }} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate text-[#111827]`}>
                      {agent.designation}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">{agent.name}</div>
                  </div>
                  {!isActive && agent.unread_count > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {agent.unread_count}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500">{agent.company_count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* OC footer */}
          <div className="px-3 py-3 border-t border-gray-200 bg-[#f4f5f7] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-700 font-medium">OC Online</span>
          </div>
        </div>

        {/* CENTRE FEED — flex:1 min-w-[440px] */}
        <div className="flex-1 flex flex-col min-w-[440px] bg-[#f4f5f7]">
          {active && (
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: active.colour }}>
                {active.designation.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{active.designation} &middot; {active.name}</div>
                <div className="text-[10px] text-gray-400">{active.company_count} companies &middot; Last sweep: {formatDate(active.last_sweep_at)}</div>
              </div>
            </div>
          )}

          {active && (
            <div className="px-4 py-2 bg-white/80 border-b border-gray-100">
              <StatsBar agent={active} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {feedLoading ? (
              <div className="text-sm text-gray-400 text-center py-8">Loading feed...</div>
            ) : feedItems.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                No messages yet. The sector agent will populate this feed after the next daily sweep.
              </div>
            ) : (
              feedItems.map((item) => <div key={item.key}>{item.content}</div>)
            )}
            <div ref={feedEndRef} />
          </div>

          <Composer />
        </div>

        {/* RIGHT PANEL — 25vw with min/max */}
        <div className="border-l border-gray-200 bg-white flex flex-col flex-shrink-0" style={{ width: "calc(25vw)", minWidth: "300px", maxWidth: "380px" }}>
          <div className="flex border-b border-gray-200">
            {(["agent", "sector", "coverage"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 px-2 py-2.5 text-xs font-medium capitalize transition-colors ${
                  rightTab === tab ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "sector" ? "Sector View" : tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {active && rightTab === "agent" && <AgentPanel agent={active} />}

            {rightTab === "sector" && (
              <div className="h-full flex flex-col">
                {sectorView ? (
                  <>
                    <div className="flex-shrink-0 space-y-4">
                      <div className="flex items-center gap-2">
                        {stanceBadge(sectorView.stance)}
                        {convictionStars(sectorView.conviction)}
                      </div>

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
                    </div>

                    {/* Divider + scrollable company list */}
                    <div className="border-t border-gray-200 pt-3 mt-3 flex-1 min-h-0 flex flex-col">
                      <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex-shrink-0">Companies</h4>
                      <div className="flex-1 overflow-y-auto space-y-1">
                        {active?.companies.map((c) => {
                          const signalLabel = c.stance === "bullish" ? "BULL" : c.stance === "bearish" ? "BEAR" : "NEUT";
                          const signalColor = c.stance === "bullish" ? "text-green-700 bg-green-50 border-green-200" : c.stance === "bearish" ? "text-red-700 bg-red-50 border-red-200" : "text-amber-700 bg-amber-50 border-amber-200";
                          const signalArrow = c.stance === "bullish" ? "\u2191" : c.stance === "bearish" ? "\u2193" : "\u2192";
                          return (
                            <Link
                              key={c.id}
                              href={`/company/${c.id}`}
                              className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <span className="text-xs font-medium text-gray-900">{c.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono ml-1.5">{c.ticker}</span>
                              </div>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${signalColor}`}>
                                {signalArrow} {signalLabel}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100 flex-shrink-0">
                      Updated: {formatDateTime(sectorView.lastUpdated)}
                      {sectorView.lastUpdatedReason && (
                        <div className="mt-0.5">Trigger: {sectorView.lastUpdatedReason}</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-8">
                    No sector view yet. Will be generated after the next sweep.
                  </div>
                )}
              </div>
            )}

            {active && rightTab === "coverage" && <CoveragePanel agent={active} />}
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT (<=768px) ── */}
      <div className="md:hidden flex flex-col h-[calc(100vh-52px)]">
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
            <div className="relative w-72 bg-white h-full shadow-xl overflow-y-auto animate-slide-in-left">
              <div className="px-4 py-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-900">Sector Channels</span>
              </div>
              {agents.map((agent) => (
                <button
                  key={agent.sector_key}
                  onClick={() => { setActiveKey(agent.sector_key); setDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left min-h-[44px] ${
                    agent.sector_key === activeKey ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: agent.colour }} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{agent.designation}</div>
                    <div className="text-xs text-gray-500">{agent.name}</div>
                  </div>
                  {agent.sector_key !== activeKey && agent.unread_count > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {agent.unread_count}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">{agent.company_count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {active && (
          <div className="flex items-center px-3 py-2.5 bg-white border-b border-gray-200 min-h-[44px]">
            <button onClick={() => setDrawerOpen(true)} className="p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <span className="text-sm font-semibold text-gray-900">{active.designation} &middot; {active.name}</span>
            </div>
            <div className="w-[44px]" />
          </div>
        )}

        {active && mobileTab === "feed" && (
          <div className="px-3 py-1.5 bg-white/80 border-b border-gray-100 overflow-x-auto">
            <StatsBar agent={active} compact />
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-[#f4f5f7]">
          {mobileTab === "feed" && (
            <div className="px-3 py-3 space-y-2">
              {feedLoading ? (
                <div className="text-sm text-gray-400 text-center py-8">Loading...</div>
              ) : mobileFeedItems.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-8">No feed items yet.</div>
              ) : (
                <>
                  {!showAllSweep && feedItems.length > mobileFeedItems.length && (
                    <button onClick={() => setShowAllSweep(true)} className="w-full text-center text-xs text-blue-600 py-2 min-h-[44px]">
                      Show all {feedItems.length} entries
                    </button>
                  )}
                  {mobileFeedItems.map((item) => <div key={item.key}>{item.content}</div>)}
                </>
              )}
              <div ref={feedEndRef} />
            </div>
          )}

          {mobileTab === "agent" && active && <div className="p-4"><AgentPanel agent={active} /></div>}
          {mobileTab === "coverage" && active && <div className="p-3"><CoveragePanel agent={active} /></div>}
        </div>

        <Composer mobile />

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
                mobileTab === tab.key ? "text-gray-900" : "text-gray-400"
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
