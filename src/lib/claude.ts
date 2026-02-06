import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export type SweepClassification = "NO_CHANGE" | "NOTABLE" | "MATERIAL";

export interface SweepResult {
  classification: SweepClassification;
  summary: string;
  detail: {
    what_happened: string;
    why_it_matters: string;
    recommended_action: string;
    confidence: "high" | "medium" | "low";
    sources: string[];
  } | null;
  suggested_profile_updates: Record<string, unknown> | null;
}

export interface WebSearchResult {
  query: string;
  results: string;
}

/**
 * Perform a web search using Claude's built-in web search tool.
 * Returns the text content Claude synthesized from search results.
 */
export async function webSearch(query: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
    messages: [
      {
        role: "user",
        content: `Search for: ${query}\n\nProvide a brief summary (under 500 words) of the most relevant recent findings.`,
      },
    ],
  });

  // Extract text from the response, which may include multiple content blocks
  const textBlocks = response.content.filter(
    (block) => block.type === "text"
  );
  return textBlocks.map((block) => "text" in block ? block.text : "").join("\n\n") || "No results found.";
}

/**
 * Run the daily sweep analysis using Claude.
 * Takes the company context and new data, returns a structured assessment.
 */
export async function analyzeSweep(opts: {
  companyName: string;
  ticker: string;
  investmentView: string;
  conviction: string;
  thesis: string;
  keyAssumptions: string[];
  riskFactors: string[];
  sweepFocus: string[];
  newData: { source: string; content: string }[];
}): Promise<SweepResult> {
  const {
    companyName,
    ticker,
    investmentView,
    conviction,
    thesis,
    keyAssumptions,
    riskFactors,
    sweepFocus,
    newData,
  } = opts;

  const systemPrompt = `You are a senior equity research analyst dedicated to covering ${companyName} (${ticker}).

Your role is to conduct a daily sweep of new information and assess whether anything is material to the current investment thesis.

CURRENT INVESTMENT VIEW:
View: ${investmentView} | Conviction: ${conviction}

CURRENT THESIS & KEY ASSUMPTIONS:
Thesis: ${thesis}

Key Assumptions:
${keyAssumptions.map((a) => `- ${a}`).join("\n")}

Risk Factors:
${riskFactors.map((r) => `- ${r}`).join("\n")}

DAILY SWEEP CRITERIA — FOCUS AREAS:
${sweepFocus.map((f) => `- ${f}`).join("\n")}

INSTRUCTIONS:
1. Review the new information provided below
2. Assess each item against the current thesis and focus areas
3. Classify the overall sweep as: NO_CHANGE, NOTABLE, or MATERIAL
4. If NOTABLE or MATERIAL, provide a structured brief
5. If MATERIAL, recommend specific updates to the investment view or model

Respond ONLY with valid JSON in the following format (no markdown, no code fences):
{
  "classification": "NO_CHANGE" | "NOTABLE" | "MATERIAL",
  "summary": "One-line summary",
  "detail": {
    "what_happened": "...",
    "why_it_matters": "...",
    "recommended_action": "...",
    "confidence": "high" | "medium" | "low",
    "sources": ["..."]
  },
  "suggested_profile_updates": null
}

For NO_CHANGE, set summary to "Sweep completed: no change to Investment View" and detail to null.
For NOTABLE, fill in detail but set suggested_profile_updates to null.
For MATERIAL, fill in both detail and suggested_profile_updates with recommended changes.`;

  const userContent = newData.length > 0
    ? `NEW INFORMATION FROM TODAY'S SWEEP:\n\n${newData
        .map((d) => `=== SOURCE: ${d.source} ===\n${d.content}`)
        .join("\n\n")}`
    : "No new information was found from any monitored source today. All sources returned no updates or changes since the last sweep.";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  const rawText = response.content
    .filter((block) => block.type === "text")
    .map((block) => "text" in block ? block.text : "")
    .join("");

  try {
    // Try direct parse first
    const parsed = JSON.parse(rawText) as SweepResult;
    return parsed;
  } catch {
    // Try extracting JSON from markdown code fences or surrounding text
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as SweepResult;
        return parsed;
      }
    } catch {
      // Fall through
    }
    return {
      classification: "NO_CHANGE",
      summary: "Sweep completed: parsing error — defaulting to no change",
      detail: null,
      suggested_profile_updates: null,
    };
  }
}

/**
 * Run deep analysis using Opus for material findings.
 * Triggered when the initial sweep detects material information.
 */
export async function deepAnalysis(opts: {
  companyName: string;
  ticker: string;
  materialFinding: SweepResult;
  fullProfile: Record<string, unknown>;
}): Promise<{
  updatedProfile: Record<string, unknown>;
  analysisNotes: string;
}> {
  const { companyName, ticker, materialFinding, fullProfile } = opts;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    system: `You are a senior equity research analyst conducting deep analysis on ${companyName} (${ticker}). A material finding has been detected in the daily sweep. Your task is to analyze the finding in depth and recommend specific updates to the company profile.`,
    messages: [
      {
        role: "user",
        content: `MATERIAL FINDING:
${JSON.stringify(materialFinding, null, 2)}

CURRENT FULL PROFILE:
${JSON.stringify(fullProfile, null, 2)}

Analyze this material finding and provide:
1. An updated company profile JSON (same structure as current, with modifications)
2. Detailed analysis notes explaining your reasoning

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "updatedProfile": { ... },
  "analysisNotes": "..."
}`,
      },
    ],
  });

  const rawText = response.content
    .filter((block) => block.type === "text")
    .map((block) => "text" in block ? block.text : "")
    .join("");

  try {
    return JSON.parse(rawText);
  } catch {
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fall through
    }
    return {
      updatedProfile: fullProfile,
      analysisNotes: "Deep analysis parsing failed. Profile unchanged.",
    };
  }
}
