"use client";

import { useEffect, useRef } from "react";

interface SharePriceChartProps {
  ticker: string;
  companyName: string;
}

export default function SharePriceChart({ ticker, companyName }: SharePriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `TSE:${ticker.replace(".T", "")}`,
      interval: "D",
      timezone: "Asia/Tokyo",
      theme: "light",
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      backgroundColor: "rgba(255, 255, 255, 1)",
      gridColor: "rgba(243, 244, 246, 1)",
    });

    containerRef.current.appendChild(script);
  }, [ticker]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-6 pt-5 pb-2">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Share Price — {companyName}
        </h2>
      </div>
      <div className="tradingview-widget-container" style={{ height: 400 }}>
        <div
          ref={containerRef}
          className="tradingview-widget-container__widget"
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
}
