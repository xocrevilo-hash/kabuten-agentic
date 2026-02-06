"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const COMPANIES = [
  { id: "8035", name: "Tokyo Electron", ticker: "8035.T", sector: "Semiconductor Equipment" },
  { id: "6146", name: "Disco Corporation", ticker: "6146.T", sector: "Semiconductor Equipment" },
  { id: "6857", name: "Advantest", ticker: "6857.T", sector: "Semiconductor Equipment" },
];

const THEMES = ["semiconductor equipment", "AI capex", "advanced packaging", "HBM", "EUV", "test systems"];

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
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
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
