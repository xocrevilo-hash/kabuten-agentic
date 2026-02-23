import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ── Keyword definitions (mirrors heatmap page) ──────────────────────────────

const HEATMAP_KEYWORDS: { keyword: string; category: string }[] = [
  { keyword: "HBM", category: "AI & ML" },
  { keyword: "AI agents", category: "AI & ML" },
  { keyword: "inference", category: "AI & ML" },
  { keyword: "LLM", category: "AI & ML" },
  { keyword: "AI training", category: "AI & ML" },
  { keyword: "edge AI", category: "AI & ML" },
  { keyword: "autonomous driving", category: "AI & ML" },
  { keyword: "robotics", category: "AI & ML" },
  { keyword: "quantum computing", category: "AI & ML" },
  { keyword: "TSMC", category: "Semiconductors" },
  { keyword: "Nvidia", category: "Semiconductors" },
  { keyword: "semiconductor", category: "Semiconductors" },
  { keyword: "CoWoS", category: "Semiconductors" },
  { keyword: "advanced packaging", category: "Semiconductors" },
  { keyword: "EUV", category: "Semiconductors" },
  { keyword: "foundry", category: "Semiconductors" },
  { keyword: "GPU", category: "Semiconductors" },
  { keyword: "DRAM", category: "Semiconductors" },
  { keyword: "NAND", category: "Semiconductors" },
  { keyword: "custom ASIC", category: "Semiconductors" },
  { keyword: "silicon photonics", category: "Semiconductors" },
  { keyword: "Intel", category: "Semiconductors" },
  { keyword: "AMD", category: "Semiconductors" },
  { keyword: "SK Hynix", category: "Semiconductors" },
  { keyword: "ASML", category: "Semiconductors" },
  { keyword: "data center", category: "Cloud & Data" },
  { keyword: "cloud capex", category: "Cloud & Data" },
  { keyword: "AI server", category: "Cloud & Data" },
  { keyword: "networking", category: "Cloud & Data" },
  { keyword: "optical transceiver", category: "Cloud & Data" },
  { keyword: "Broadcom", category: "Cloud & Data" },
  { keyword: "Samsung", category: "Cloud & Data" },
  { keyword: "power semiconductor", category: "Hardware" },
  { keyword: "nuclear power", category: "Hardware" },
  { keyword: "chip ban", category: "Regulation & Trade" },
  { keyword: "AI regulation", category: "Regulation & Trade" },
  { keyword: "China sanctions", category: "Regulation & Trade" },
  { keyword: "tariff", category: "Regulation & Trade" },
  { keyword: "energy transition", category: "Energy & Materials" },
  { keyword: "battery", category: "Energy & Materials" },
];

// ── Colour mapping (mirrors heatmap page getScoreColor logic) ───────────────

function scoreToColourHex(score: number): string {
  if (score >= 75) return "#ef4444"; // red-500   — Surging
  if (score >= 60) return "#fb923c"; // orange-400 — Hot
  if (score >= 55) return "#fbbf24"; // amber-400  — Warm
  if (score >= 45) return "#d1d5db"; // gray-300   — Neutral
  if (score >= 30) return "#93c5fd"; // blue-300   — Cool
  return "#3b82f6";                  // blue-500   — Cold
}

// ── Score a batch of keywords via Claude web search ─────────────────────────

async function scoreBatch(
  keywords: string[],
  anthropic: Anthropic
): Promise<Record<string, number>> {
  const list = keywords.map((k, i) => `${i + 1}. ${k}`).join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [{ type: "web_search_20250305" as const, name: "web_search", max_uses: 5 }],
    messages: [
      {
        role: "user",
        content: `You are a tech/finance sentiment analyst. Rate the current social media and news buzz for each keyword on a 0–100 scale:

- 90–100: Trending heavily (major breaking news, viral discussion)
- 70–89: Hot (significant news coverage, active discussion)
- 50–69: Warm (above-average activity)
- 40–49: Neutral (background level)
- 20–39: Cool (below-average, limited discussion)
- 0–19: Cold (very little current buzz)

Use web search to check recent news (past 7 days) to inform your ratings.

Keywords to rate:
${list}

Respond with ONLY a valid JSON object mapping each keyword exactly as written to its score. Example:
{"HBM": 72, "AI agents": 85}

Return scores for ALL ${keywords.length} keywords listed above.`,
      },
    ],
  });

  // Extract the final text block (Claude's JSON answer)
  const textBlocks = response.content.filter((b) => b.type === "text");
  const raw = textBlocks.map((b) => (b as { type: "text"; text: string }).text).join("");

  // Parse JSON from response — handle markdown code fences
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const score = Number(v);
      if (!isNaN(score)) result[k] = Math.min(100, Math.max(0, Math.round(score)));
    }
    return result;
  } catch {
    return {};
  }
}

// ── Route handlers ───────────────────────────────────────────────────────────

async function handler(request: Request) {
  // CRON_SECRET auth (same pattern as /api/sweep/run)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { initializeDatabase, upsertHeatmapResult } = await import("@/lib/db");
    await initializeDatabase();

    const anthropic = new Anthropic();
    const scores: Record<string, number> = {};

    // Process in batches of 10 to stay within tool-use limits per call
    const BATCH_SIZE = 10;
    for (let i = 0; i < HEATMAP_KEYWORDS.length; i += BATCH_SIZE) {
      const batch = HEATMAP_KEYWORDS.slice(i, i + BATCH_SIZE);
      const keywords = batch.map((k) => k.keyword);
      const batchScores = await scoreBatch(keywords, anthropic);
      Object.assign(scores, batchScores);
      // Brief pause between batches
      if (i + BATCH_SIZE < HEATMAP_KEYWORDS.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Upsert each keyword result
    let processed = 0;
    for (const kw of HEATMAP_KEYWORDS) {
      const score = scores[kw.keyword] ?? 50; // default neutral if Claude missed it
      await upsertHeatmapResult({
        keyword: kw.keyword,
        category: kw.category,
        score,
        colourHex: scoreToColourHex(score),
        volume: 0,
        source: "claude_websearch",
      });
      processed++;
    }

    return NextResponse.json({
      ok: true,
      keywords_processed: processed,
      swept_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Heatmap Sweep] Error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const POST = handler;

// Vercel cron uses GET
export async function GET(request: Request) {
  return handler(request);
}
