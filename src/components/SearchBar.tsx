"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const COMPANIES = [
  { id: "2345", name: "Accton Technology", ticker: "2345.TW", sector: "Networking Equipment" },
  { id: "6857", name: "Advantest", ticker: "6857.T", sector: "Semiconductor Equipment" },
  { id: "2308", name: "Delta Electronics", ticker: "2308.TW", sector: "Power Management" },
  { id: "6146", name: "Disco Corporation", ticker: "6146.T", sector: "Semiconductor Equipment" },
  { id: "300502", name: "Eoptolink Technology", ticker: "300502.SZ", sector: "Optical Transceivers" },
  { id: "FN", name: "Fabrinet", ticker: "FN", sector: "Manufacturing Services" },
  { id: "9698", name: "GDS Holdings", ticker: "9698.HK", sector: "Data Centers" },
  { id: "012450", name: "Hanwha Aerospace", ticker: "012450.KS", sector: "Defense & Aerospace" },
  { id: "6501", name: "Hitachi", ticker: "6501.T", sector: "Diversified Industrials" },
  { id: "2317", name: "Hon Hai (Foxconn)", ticker: "2317.TW", sector: "Electronics Manufacturing" },
  { id: "007660", name: "Isu Petasys", ticker: "007660.KS", sector: "PCB Manufacturing" },
  { id: "6920", name: "Lasertec", ticker: "6920.T", sector: "Semiconductor Inspection" },
  { id: "2301", name: "Lite-on Technology", ticker: "2301.TW", sector: "Optoelectronics" },
  { id: "2454", name: "Mediatek", ticker: "2454.TW", sector: "Semiconductor" },
  { id: "2408", name: "Nanya Technology", ticker: "2408.TW", sector: "Memory" },
  { id: "6752", name: "Panasonic", ticker: "6752.T", sector: "Diversified Electronics" },
  { id: "6323", name: "Rorze", ticker: "6323.T", sector: "Semiconductor Automation" },
  { id: "005930", name: "Samsung Electronics", ticker: "005930.KS", sector: "Memory & Foundry" },
  { id: "7735", name: "Screen Holdings", ticker: "7735.T", sector: "Semiconductor Equipment" },
  { id: "000660", name: "SK Hynix", ticker: "000660.KS", sector: "Memory" },
  { id: "8035", name: "Tokyo Electron", ticker: "8035.T", sector: "Semiconductor Equipment" },
  { id: "2330", name: "TSMC", ticker: "2330.TW", sector: "Semiconductor Foundry" },
  { id: "300308", name: "Zhongji Innolight", ticker: "300308.SZ", sector: "Optical Transceivers" },
];

const THEMES = [
  "semiconductor equipment", "AI capex", "advanced packaging", "HBM",
  "EUV", "test systems", "memory", "foundry", "optical transceivers",
  "data center", "power management", "defense", "networking",
  "PCB", "automation", "battery", "EV",
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredCompanies = query.length > 0
    ? COMPANIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.id.includes(query) ||
          c.ticker.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredThemes = query.length > 0
    ? THEMES.filter((t) => t.toLowerCase().includes(query.toLowerCase()))
    : [];

  const matchingFromTheme = query.length > 0 && filteredThemes.length > 0
    ? COMPANIES.filter((c) =>
        c.sector.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const allResults = [
    ...filteredCompanies.map((c) => ({ type: "company" as const, ...c })),
    ...matchingFromTheme
      .filter((c) => !filteredCompanies.find((fc) => fc.id === c.id))
      .map((c) => ({ type: "company" as const, ...c })),
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(companyId: string) {
    setIsOpen(false);
    setQuery("");
    router.push(`/company/${companyId}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(allResults[selectedIndex].id);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[580px]">
      <div className="flex items-center rounded-full border border-gray-200 bg-white px-6 py-3 shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md">
        <svg
          className="mr-3 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by code, company, or theme..."
          className="w-full bg-transparent text-base text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>

      {isOpen && allResults.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white py-2 shadow-lg max-h-80 overflow-y-auto">
          {allResults.map((result, i) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result.id)}
              className={`flex w-full items-center justify-between px-6 py-3 text-left transition-colors ${
                i === selectedIndex ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
            >
              <div>
                <span className="font-medium text-gray-900">{result.name}</span>
                <span className="ml-2 text-sm text-gray-500">{result.ticker}</span>
              </div>
              <span className="text-xs text-gray-400">{result.sector}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
