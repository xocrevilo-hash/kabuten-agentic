"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface CompanyBasic {
  id: string;
  name: string;
  ticker_full: string;
  investment_view: string;
  conviction: string;
  profile_json?: { thesis?: string };
  last_material_at?: string | null;
}

interface Holding {
  company_id: string;
  company_name: string;
  ticker_full: string;
  conviction: string;
  weight: number;
  entry_date: string;
  return_pct: number;
}

interface PortfolioData {
  holdings: Holding[];
  returns: {
    "1D": number | null;
    "1W": number | null;
    "1M": number | null;
    "3M": number | null;
    "1Y": number | null;
    "3Y": number | null;
    "5Y": number | null;
    inception: number | null;
  };
  kabutenView: string;
  changeLog: { date: string; action: string; detail: string }[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function convictionStars(conviction: string): string {
  if (conviction === "high") return "\u2605\u2605\u2605";
  if (conviction === "medium") return "\u2605\u2605\u2606";
  if (conviction === "low") return "\u2605\u2606\u2606";
  return "\u2606\u2606\u2606";
}

function convictionScore(conviction: string): number {
  if (conviction === "high") return 3;
  if (conviction === "medium") return 2;
  if (conviction === "low") return 1;
  return 0;
}

function ReturnCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400">--</span>;
  const color = value > 0 ? "text-green-600" : value < 0 ? "text-red-500" : "text-gray-600";
  return <span className={`font-mono text-sm font-semibold ${color}`}>{value > 0 ? "+" : ""}{value.toFixed(1)}%</span>;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [top20, setTop20] = useState<CompanyBasic[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPortfolio();
    loadTop20();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function loadPortfolio() {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch {
      // ignore
    }
  }

  async function loadTop20() {
    try {
      const res = await fetch("/api/companies");
      if (res.ok) {
        const companies: CompanyBasic[] = await res.json();
        const bullish = companies
          .filter((c) => c.investment_view === "bullish")
          .sort((a, b) => {
            const scoreA = convictionScore(a.conviction);
            const scoreB = convictionScore(b.conviction);
            if (scoreB !== scoreA) return scoreB - scoreA;
            const dateA = a.last_material_at ? new Date(a.last_material_at).getTime() : 0;
            const dateB = b.last_material_at ? new Date(b.last_material_at).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 20);
        setTop20(bullish);
      }
    } catch {
      // ignore
    }
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/portfolio/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: chatInput, history: chatMessages }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.answer || "No response." }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Connection error." }]);
    } finally {
      setChatLoading(false);
    }
  }

  const periods = ["1D", "1W", "1M", "3M", "1Y", "3Y", "5Y", "inception"] as const;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Highest Conviction Top 20 */}
        {top20.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Highest Conviction Top {Math.min(top20.length, 20)}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-2 text-xs font-medium text-gray-500 w-8">#</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Company</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Ticker</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Rating</th>
                    <th className="text-left py-2 pl-2 text-xs font-medium text-gray-500">Investment View</th>
                  </tr>
                </thead>
                <tbody>
                  {top20.map((company, i) => (
                    <tr key={company.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 pr-2 text-gray-400 font-mono text-xs">{i + 1}</td>
                      <td className="py-2.5 px-2">
                        <Link
                          href={`/company/${company.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {company.name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-2 text-xs text-gray-500 font-mono">{company.ticker_full}</td>
                      <td className="py-2.5 px-2 text-center text-amber-500 text-sm tracking-wider">
                        {convictionStars(company.conviction)}
                      </td>
                      <td className="py-2.5 pl-2 text-xs text-gray-600 max-w-xs truncate">
                        {company.profile_json?.thesis
                          ? company.profile_json.thesis.substring(0, 120) + (company.profile_json.thesis.length > 120 ? "..." : "")
                          : "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top section: Returns + Kabuten View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Portfolio Returns */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Portfolio Returns
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {periods.map((period) => (
                <div key={period} className="text-center">
                  <span className="text-xs text-gray-500 block mb-1">
                    {period === "inception" ? "Since Incep." : period}
                  </span>
                  <ReturnCell value={portfolio?.returns?.[period] ?? null} />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3">Inception: 9 Feb 2026. USD-denominated, equal-weighted at entry.</p>
          </div>

          {/* Kabuten View */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Kabuten View
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {portfolio?.kabutenView || "Portfolio view will be generated after the first sweep cycle completes."}
            </p>
          </div>
        </div>

        {/* Portfolio Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Portfolio Details
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-2 text-xs font-medium text-gray-500 w-8">#</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Company</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Rating</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">Weight</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">Date Entered</th>
                  <th className="text-right py-2 pl-2 text-xs font-medium text-gray-500">Return</th>
                </tr>
              </thead>
              <tbody>
                {(portfolio?.holdings || []).map((h, i) => (
                  <tr key={h.company_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 pr-2 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="py-2.5 px-2">
                      <Link
                        href={`/company/${h.company_id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {h.company_name} <span className="text-gray-400 text-xs">{h.ticker_full}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 px-2 text-center text-amber-500 text-sm tracking-wider">
                      {convictionStars(h.conviction)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-gray-700 font-mono text-xs">
                      {(h.weight * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2 text-right text-gray-500 text-xs">{h.entry_date}</td>
                    <td className={`py-2.5 pl-2 text-right font-mono text-xs font-semibold ${
                      h.return_pct > 0 ? "text-green-600" : h.return_pct < 0 ? "text-red-500" : "text-gray-600"
                    }`}>
                      {h.return_pct > 0 ? "+" : ""}{h.return_pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {(!portfolio?.holdings || portfolio.holdings.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                      Portfolio will be initialized on 9 Feb 2026 with the top 20 highest conviction ideas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Change Log */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Portfolio Change Log
          </h2>
          {(portfolio?.changeLog || []).length > 0 ? (
            <div className="space-y-2">
              {portfolio!.changeLog.map((change, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-xs text-gray-400 font-mono whitespace-nowrap">{change.date}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    change.action === "INIT" ? "bg-blue-50 text-blue-600" :
                    change.action === "ADD" ? "bg-green-50 text-green-600" :
                    "bg-red-50 text-red-600"
                  }`}>
                    {change.action}
                  </span>
                  <span className="text-gray-700">{change.detail}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No changes yet.</p>
          )}
        </div>

        {/* Chat with Portfolio Constructor */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Chat with Portfolio Constructor
          </h2>

          <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                  <p className="text-sm text-gray-400">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); sendChat(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about the portfolio..."
              className="flex-1 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none shadow-sm focus:shadow-md transition-shadow"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
