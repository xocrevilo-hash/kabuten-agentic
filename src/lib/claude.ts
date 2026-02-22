import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export type SweepClassification = "NO_CHANGE" | "NOTABLE" | "MATERIAL";

export interface InvestmentViewDetail {
  stance: string;
  conviction: string;
  thesis_summary: string;
  valuation_assessment: string[];
  conviction_rationale: string[];
  key_drivers: string[];
  key_risks: string[];
  catalysts?: string[];
  last_updated: string;
  last_updated_reason: string;
}

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
  sectorPeerFindings?: string;
  currentNarrative?: Record<string, string> | null;
  currentOutlook?: Record<string, string> | null;
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
    sectorPeerFindings,
    currentNarrative,
    currentOutlook,
  } = opts;

  const hasNarrative = currentNarrative && currentNarrative.earnings_trend;
  const hasOutlook = currentOutlook && currentOutlook.fundamentals;
  const needsFirstRun = !hasNarrative || !hasOutlook;

  const peerContextBlock = sectorPeerFindings
    ? `\nSECTOR PEER CONTEXT (recent findings from companies in the same sector group — use to detect cross-company signals):\n${sectorPeerFindings}\n`
    : "";

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
${peerContextBlock}
INSTRUCTIONS:
1. Review the new information provided below
2. Assess each item against the current thesis and focus areas
3. If sector peer context is provided, consider whether peer company findings signal broader sector trends affecting this company
4. Classify the overall sweep as: NO_CHANGE, NOTABLE, or MATERIAL
5. If NOTABLE or MATERIAL, provide a structured brief
6. If MATERIAL, recommend specific updates to the investment view or model
7. INVESTMENT VIEW CONTENT LIMITS (strictly enforced):
   - thesis_summary: MAX 100 WORDS
   - valuation_assessment: MAX 4 bullet points
   - key_drivers: MAX 3 bullet points
   - key_risks: MAX 3 bullet points
   - conviction_rationale: MAX 4 bullet points
8. When suggesting profile updates (for MATERIAL findings), the suggested_profile_updates MUST include an investment_view_detail object with the fields above
9. If MATERIAL, ALSO include "narrative_updates" and "outlook_updates" in your response (see format below). Each sub-section must be max 80 words of prose (no bullet points).
10. FIRST-RUN RULE: ${needsFirstRun ? "The current narrative and/or outlook is EMPTY. You MUST generate narrative_updates AND outlook_updates regardless of classification (even for NO_CHANGE). This ensures all companies get populated." : "Narrative and outlook already exist. Only include narrative_updates and outlook_updates for MATERIAL findings."}

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
  "suggested_profile_updates": null,
  "narrative_updates": {
    "earnings_trend": "Max 80 words prose on earnings trend past 3 quarters",
    "recent_newsflow": "Max 80 words prose on recent newsflow past 6 months",
    "long_term_trajectory": "Max 80 words prose on long-term trajectory 3 years"
  },
  "outlook_updates": {
    "fundamentals": "Max 80 words prose on fundamental outlook",
    "financials": "Max 80 words prose on financial outlook",
    "risks": "Max 80 words prose on key risks"
  }
}

For NO_CHANGE, set summary to "Sweep completed: no change to Investment View" and detail to null. ${needsFirstRun ? "But STILL include narrative_updates and outlook_updates (first-run rule)." : "Set narrative_updates and outlook_updates to null."}
For NOTABLE, fill in detail but set suggested_profile_updates to null. ${needsFirstRun ? "Include narrative_updates and outlook_updates (first-run rule)." : "Set narrative_updates and outlook_updates to null."}
For MATERIAL, fill in detail, suggested_profile_updates (with investment_view_detail), AND narrative_updates and outlook_updates.`;

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
    system: `You are a senior equity research analyst conducting deep analysis on ${companyName} (${ticker}). A material finding has been detected in the daily sweep. Your task is to analyze the finding in depth and recommend specific updates to the company profile.

INVESTMENT VIEW FORMAT REQUIREMENTS (strictly enforced):
The updatedProfile MUST include an investment_view_detail object with:
- stance: "bullish" | "neutral" | "bearish"
- conviction: "high" | "medium" | "low"
- thesis_summary: MAX 100 WORDS (concise investment case)
- valuation_assessment: array of MAX 4 bullet point strings
- key_drivers: array of EXACTLY 3 bullet point strings
- key_risks: array of EXACTLY 3 bullet point strings
- conviction_rationale: array of MAX 4 bullet point strings
- last_updated: ISO timestamp
- last_updated_reason: what triggered the update`,
    messages: [
      {
        role: "user",
        content: `MATERIAL FINDING:
${JSON.stringify(materialFinding, null, 2)}

CURRENT FULL PROFILE:
${JSON.stringify(fullProfile, null, 2)}

Analyze this material finding and provide:
1. An updated company profile JSON (same structure as current, with modifications) — MUST include investment_view_detail
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

/**
 * Generate a short-format Investment View for a company.
 * Used to re-generate all existing views to comply with new format limits.
 */
export async function generateInvestmentView(opts: {
  companyName: string;
  ticker: string;
  sector: string;
  overview: string;
  currentThesis: string;
  currentView: string;
  currentConviction: string;
  keyAssumptions: string[];
  riskFactors: string[];
}): Promise<InvestmentViewDetail> {
  const { companyName, ticker, sector, overview, currentThesis, currentView, currentConviction, keyAssumptions, riskFactors } = opts;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: `You are a senior equity research analyst. Generate a concise Investment View for ${companyName} (${ticker}) in the ${sector} sector.

STRICT FORMAT REQUIREMENTS:
- thesis_summary: MAX 100 WORDS — concise investment case
- valuation_assessment: array of MAX 4 short bullet strings — current valuation context
- key_drivers: array of EXACTLY 3 short bullet strings — positive catalysts
- key_risks: array of EXACTLY 3 short bullet strings — downside risks
- conviction_rationale: array of MAX 4 short bullet strings — why conviction is at this level

Each bullet should be one concise sentence. Do not exceed the limits.`,
    messages: [
      {
        role: "user",
        content: `COMPANY OVERVIEW:
${overview}

CURRENT STANCE: ${currentView}
CURRENT CONVICTION: ${currentConviction}

EXISTING THESIS:
${currentThesis}

EXISTING KEY ASSUMPTIONS:
${keyAssumptions.map((a) => `- ${a}`).join("\n")}

EXISTING RISK FACTORS:
${riskFactors.map((r) => `- ${r}`).join("\n")}

Generate a tightly formatted Investment View. Respond ONLY with valid JSON (no markdown):
{
  "stance": "${currentView}",
  "conviction": "${currentConviction}",
  "thesis_summary": "...",
  "valuation_assessment": ["...", "..."],
  "key_drivers": ["...", "...", "..."],
  "key_risks": ["...", "...", "..."],
  "conviction_rationale": ["...", "..."],
  "last_updated": "${new Date().toISOString()}",
  "last_updated_reason": "Investment View format migration"
}`,
      },
    ],
  });

  const rawText = response.content
    .filter((block) => block.type === "text")
    .map((block) => "text" in block ? block.text : "")
    .join("");

  try {
    return JSON.parse(rawText) as InvestmentViewDetail;
  } catch {
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as InvestmentViewDetail;
      }
    } catch {
      // Fall through
    }
    // Return a minimal valid structure
    return {
      stance: opts.currentView,
      conviction: opts.currentConviction,
      thesis_summary: opts.currentThesis.split(" ").slice(0, 100).join(" "),
      valuation_assessment: ["Valuation data pending"],
      key_drivers: opts.keyAssumptions.slice(0, 3).length === 3
        ? opts.keyAssumptions.slice(0, 3)
        : [...opts.keyAssumptions.slice(0, 3), ...Array(3 - Math.min(opts.keyAssumptions.length, 3)).fill("To be determined")],
      key_risks: opts.riskFactors.slice(0, 3).length === 3
        ? opts.riskFactors.slice(0, 3)
        : [...opts.riskFactors.slice(0, 3), ...Array(3 - Math.min(opts.riskFactors.length, 3)).fill("To be determined")],
      conviction_rationale: ["Conviction rationale pending"],
      last_updated: new Date().toISOString(),
      last_updated_reason: "Investment View format migration (parse fallback)",
    };
  }
}

/**
 * Generate an initial sector-level Investment View from member companies' profiles.
 * Used when sector_views has no row for a sector (first run).
 */
export async function generateInitialSectorView(opts: {
  sectorName: string;
  companies: { name: string; ticker: string; stance: string; conviction: string; thesis: string }[];
}): Promise<InvestmentViewDetail> {
  const { sectorName, companies } = opts;

  const companyContext = companies
    .map((c) => `${c.name} (${c.ticker}) — Stance: ${c.stance}, Conviction: ${c.conviction}\nThesis: ${c.thesis || "N/A"}`)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: `You are a senior equity research analyst. Generate an initial sector-level Investment View for the ${sectorName} sector by synthesising the individual company investment views below.

STRICT FORMAT REQUIREMENTS:
- stance: "bullish" | "neutral" | "bearish"
- conviction: "high" | "medium" | "low"
- thesis_summary: MAX 100 WORDS — concise sector investment case
- valuation_assessment: array of MAX 4 bullet point strings
- key_drivers: array of EXACTLY 3 bullet point strings
- key_risks: array of EXACTLY 3 bullet point strings
- conviction_rationale: array of MAX 4 bullet point strings`,
    messages: [
      {
        role: "user",
        content: `MEMBER COMPANIES:\n${companyContext}\n\nGenerate an initial sector Investment View. Respond ONLY with valid JSON (no markdown):\n{
  "stance": "...",
  "conviction": "...",
  "thesis_summary": "...",
  "valuation_assessment": ["..."],
  "key_drivers": ["...", "...", "..."],
  "key_risks": ["...", "...", "..."],
  "conviction_rationale": ["..."],
  "last_updated": "${new Date().toISOString()}",
  "last_updated_reason": "Initial sector view generated"
}`,
      },
    ],
  });

  const rawText = response.content
    .filter((block) => block.type === "text")
    .map((block) => "text" in block ? block.text : "")
    .join("");

  try {
    return JSON.parse(rawText) as InvestmentViewDetail;
  } catch {
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as InvestmentViewDetail;
      }
    } catch {
      // Fall through
    }
    return {
      stance: "neutral",
      conviction: "medium",
      thesis_summary: `Initial view for ${sectorName} sector pending generation.`,
      valuation_assessment: ["Valuation data pending"],
      key_drivers: ["Growth potential pending", "Market dynamics pending", "Innovation pipeline pending"],
      key_risks: ["Market risk pending", "Regulatory risk pending", "Competition risk pending"],
      conviction_rationale: ["Initial assessment pending"],
      last_updated: new Date().toISOString(),
      last_updated_reason: "Initial sector view generated (parse fallback)",
    };
  }
}

/**
 * Synthesise a sector-level Investment View from individual company sweep results.
 */
export async function synthesizeSectorView(opts: {
  sectorName: string;
  companies: { name: string; ticker: string; stance: string; conviction: string }[];
  currentSectorView: {
    stance?: string;
    conviction?: string;
    thesis_summary?: string;
    valuation_assessment?: string[];
    conviction_rationale?: string[];
  } | null;
  todaySweepResults: { company_name: string; severity: string; summary: string }[];
}): Promise<{
  classification: string;
  summary: string;
  detail: Record<string, unknown> | null;
  suggested_sector_view_update: InvestmentViewDetail | null;
}> {
  const { sectorName, companies, currentSectorView, todaySweepResults } = opts;

  const companyList = companies
    .map((c) => `${c.name} (${c.ticker}) — ${c.stance}, ${c.conviction} conviction`)
    .join("\n");

  const sweepResults = todaySweepResults.length > 0
    ? todaySweepResults.map((r) => `${r.company_name}: [${r.severity}] ${r.summary}`).join("\n")
    : "No sweep results available for today.";

  const currentView = currentSectorView
    ? `Stance: ${currentSectorView.stance || "neutral"} | Conviction: ${currentSectorView.conviction || "medium"}
Thesis: ${currentSectorView.thesis_summary || "No thesis yet"}
Valuation: ${(currentSectorView.valuation_assessment || []).join("; ")}
Conviction Rationale: ${(currentSectorView.conviction_rationale || []).join("; ")}`
    : "No existing sector view — this is the first assessment.";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: `You are a senior equity research analyst covering the ${sectorName} sector.

Your role is to maintain an investment view on this sector by synthesising the daily sweep results from the individual company analysts who cover each company in your group.

COMPANIES IN THIS SECTOR:
${companyList}

CURRENT SECTOR INVESTMENT VIEW:
${currentView}

TODAY'S DAILY SWEEP RESULTS FROM COMPANY AGENTS:
${sweepResults}

INSTRUCTIONS:
1. Review today's sweep results from each company agent in your sector
2. Assess whether the aggregated picture changes the sector thesis
3. Look for sector-wide themes: are multiple companies seeing the same trend?
4. Classify the sector sweep as: NO_CHANGE, INCREMENTAL, or MATERIAL
5. Apply a HIGH hurdle rate for MATERIAL — most days should be NO_CHANGE
6. If MATERIAL, update the Sector Investment View with strict format limits

INVESTMENT VIEW FORMAT REQUIREMENTS (strictly enforced):
- thesis_summary: MAX 100 WORDS
- valuation_assessment: array of MAX 4 bullet point strings
- key_drivers: array of EXACTLY 3 bullet point strings
- key_risks: array of EXACTLY 3 bullet point strings
- conviction_rationale: array of MAX 4 bullet point strings

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "classification": "NO_CHANGE" | "INCREMENTAL" | "MATERIAL",
  "summary": "One-line summary of sector sweep",
  "detail": {
    "sector_themes": "...",
    "company_highlights": "...",
    "valuation_context": "...",
    "recommended_action": "..."
  },
  "suggested_sector_view_update": null
}

For NO_CHANGE, set detail to a brief summary object and suggested_sector_view_update to null.
For INCREMENTAL, fill in detail but set suggested_sector_view_update to null.
For MATERIAL, fill in both detail and suggested_sector_view_update with the full investment_view_detail structure.`,
    messages: [
      {
        role: "user",
        content: `Analyze today's sweep results for the ${sectorName} sector and provide your assessment.`,
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
      classification: "NO_CHANGE",
      summary: "Sector sweep completed: parsing error — defaulting to no change",
      detail: null,
      suggested_sector_view_update: null,
    };
  }
}
