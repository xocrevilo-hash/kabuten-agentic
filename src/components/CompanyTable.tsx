"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface CompanyRow {
  id: string;
  name: string;
  ticker_full: string;
  country: string;
  classification: string;
  market_cap_usd: number | null;
  investment_view: string;
  conviction: string;
}

type SortKey = "ticker_full" | "name" | "country" | "classification" | "market_cap_usd" | "investment_view" | "conviction";
type SortDir = "asc" | "desc";

const CONVICTION_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 };
const VIEW_ORDER: Record<string, number> = { bullish: 3, neutral: 2, bearish: 1 };

function convictionStars(level: string) {
  const n = CONVICTION_ORDER[level] || 1;
  return "\u2605".repeat(n) + "\u2606".repeat(3 - n);
}

function viewBadge(view: string) {
  const colors: Record<string, string> = {
    bullish: "text-green-700 bg-green-50 border-green-200",
    bearish: "text-red-700 bg-red-50 border-red-200",
    neutral: "text-amber-700 bg-amber-50 border-amber-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${colors[view] || colors.neutral}`}>
      {view}
    </span>
  );
}

export default function CompanyTable({ companies }: { companies: CompanyRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("market_cap_usd");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!filter) return companies;
    const q = filter.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.ticker_full.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.classification.toLowerCase().includes(q) ||
        c.investment_view.toLowerCase().includes(q)
    );
  }, [companies, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "market_cap_usd":
          cmp = (a.market_cap_usd || 0) - (b.market_cap_usd || 0);
          break;
        case "conviction":
          cmp = (CONVICTION_ORDER[a.conviction] || 0) - (CONVICTION_ORDER[b.conviction] || 0);
          break;
        case "investment_view":
          cmp = (VIEW_ORDER[a.investment_view] || 0) - (VIEW_ORDER[b.investment_view] || 0);
          break;
        default:
          cmp = (a[sortKey] || "").localeCompare(b[sortKey] || "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "market_cap_usd" ? "desc" : "asc");
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <span className="text-gray-300 ml-1">{"\u21C5"}</span>;
    return <span className="text-gray-600 ml-1">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>;
  };

  const columns: { key: SortKey; label: string; align?: string }[] = [
    { key: "ticker_full", label: "Code" },
    { key: "name", label: "Company" },
    { key: "country", label: "Country" },
    { key: "classification", label: "Classification" },
    { key: "market_cap_usd", label: "Mkt Cap ($bn)", align: "right" },
    { key: "investment_view", label: "View" },
    { key: "conviction", label: "Conviction" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Filter bar */}
      <div className="px-4 py-3 border-b border-gray-100">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name, ticker, country, classification..."
          className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-300 focus:bg-white transition-colors"
        />
      </div>
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-gray-200 bg-gray-50/95 backdrop-blur-sm">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none whitespace-nowrap ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                  {sortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.id}
                onClick={() => router.push(`/company/${c.id}`)}
                className="border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5 font-mono text-xs text-gray-600 whitespace-nowrap">{c.ticker_full}</td>
                <td className="px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">{c.name}</td>
                <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{c.country}</td>
                <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-xs">{c.classification}</td>
                <td className="px-4 py-2.5 text-gray-700 text-right font-mono whitespace-nowrap">
                  {c.market_cap_usd ? c.market_cap_usd.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "\u2014"}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">{viewBadge(c.investment_view)}</td>
                <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                  <span className="text-amber-500">{convictionStars(c.conviction)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
        {sorted.length} of {companies.length} companies{filter ? " (filtered)" : ""} — click column headers to sort
      </div>
    </div>
  );
}
