"use client";

import { useState, useRef, useEffect } from "react";

type SourceScope = "kabuten" | "claude" | "internet" | "all";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HistoryItem {
  id: number;
  query: string;
  answer: string;
  source: string;
  created_at: string;
}

const SAMPLE_QUESTIONS = [
  "Why did you change your view on Advantest?",
  "What factors coincided with the previous peak in SK Hynix?",
  "Why has Adobe been underperforming recently?",
  "What do analysts forecast for Google's capex in 2027?",
];

export default function AskKabutenPage() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceScope>("kabuten");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const res = await fetch("/api/ask/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (questionText?: string) => {
    const q = questionText || query;
    if (!q.trim() || loading) return;

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, source, history: messages }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer || "No answer available." }]);
        // Refresh history after successful question
        loadHistory();
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setMessages([
      { role: "user", content: item.query },
      { role: "assistant", content: item.answer },
    ]);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar — Question History */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} flex-shrink-0 transition-all duration-200 overflow-hidden border-r border-gray-100 bg-gray-50/50`}>
        <div className="w-72 h-full flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Question History</h2>
            <button
              onClick={() => {
                setMessages([]);
                setQuery("");
              }}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <p className="px-4 py-6 text-xs text-gray-400 text-center">No questions asked yet</p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-white transition-colors"
                >
                  <p className="text-sm text-gray-800 truncate">{item.query}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                      {item.source}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toggle sidebar button */}
        <div className="px-4 py-2 flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={sidebarOpen ? "Hide history" : "Show history"}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Ask Kabuten</h1>
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 flex flex-col">
          {messages.length === 0 ? (
            /* Empty state — prominent search */
            <div className="flex-1 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">What would you like to know?</h2>

              {/* Source toggle */}
              <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-full p-1">
                {(["kabuten", "claude", "internet", "all"] as SourceScope[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSource(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      source === s
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {s === "kabuten" ? "Kabuten Only" : s === "claude" ? "Claude" : s === "internet" ? "Internet" : "All Sources"}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                className="w-full max-w-[580px] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about any covered company..."
                  className="flex-1 px-6 py-3 rounded-full border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none shadow-sm hover:shadow-md focus:shadow-md transition-shadow"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="px-5 py-3 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Ask
                </button>
              </form>

              {/* Sample questions */}
              <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-lg">
                {SAMPLE_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(q)}
                    className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation view */
            <>
              <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <p className="text-sm text-gray-400">Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Source toggle + input */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-1 mb-3 bg-gray-100 rounded-full p-1 w-fit">
                  {(["kabuten", "claude", "internet", "all"] as SourceScope[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSource(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        source === s
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {s === "kabuten" ? "Kabuten" : s === "claude" ? "Claude" : s === "internet" ? "Internet" : "All"}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 px-5 py-3 rounded-full border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none shadow-sm focus:shadow-md transition-shadow"
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || loading}
                    className="px-5 py-3 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Ask
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
