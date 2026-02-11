"use client";

import { useState, useEffect } from "react";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated by trying to read a cookie indicator
    // We'll check by making a lightweight request
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: "__check__" }),
        });
        // If we get 401, we're not authenticated
        // But we also need a proper check endpoint
        setIsAuthenticated(false);
      } catch {
        setIsAuthenticated(false);
      }
    };

    // Check session storage first for quick gate bypass
    if (typeof window !== "undefined" && sessionStorage.getItem("kabuten_auth") === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem("kabuten_auth", "true");
        setIsAuthenticated(true);
      } else {
        setError("Incorrect password");
        setPassword("");
      }
    } catch {
      setError("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return null;
  }

  // Authenticated — render content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Password gate
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] kanji-wallpaper">
      <div className="flex flex-col items-center gap-8">
        <h1
          className="kabuten-logo font-bold tracking-[0.15em] leading-none select-none text-[72px] sm:text-[90px]"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          KABUTEN
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="w-full px-6 py-3 rounded-full border border-gray-200 bg-white text-center text-base text-gray-700 placeholder-gray-400 outline-none shadow-sm hover:shadow-md focus:shadow-md transition-shadow"
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading || !password}
            className="px-8 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
