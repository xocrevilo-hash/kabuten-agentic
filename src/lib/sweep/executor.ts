import { getCompanies, getCompany, insertActionLog, updateCompanyAfterSweep, insertSweepData, getLatestSweepData, updateCompanyMarketCap, getSectorPeerFindings } from "@/lib/db";
import { analyzeSweep, deepAnalysis, type SweepResult } from "@/lib/claude";
import { fetchIRPage } from "./fetchers/ir-page";
import { fetchNews } from "./fetchers/news";
import { fetchTwitter } from "./fetchers/twitter";
import { fetchPrice } from "./fetchers/price";
import { fetchIndustry } from "./fetchers/industry";
import { fetchEdinet } from "./fetchers/edinet";
import { fetchReddit } from "./fetchers/reddit";
import { createHash } from "crypto";

export interface SweepLog {
  companyId: string;
  companyName: string;
  status: "success" | "error";
  classification?: string;
  summary?: string;
  error?: string;
  durationMs: number;
}

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 32);
}

/**
 * Fetch all data sources for a company. Returns array of { source, content } pairs.
 * Checks content hashes against the last sweep to determine if data is new.
 */
async function fetchAllSources(
  companyId: string,
  companyName: string,
  ticker: string,
  sector: string,
  enabledSources: string[]
): Promise<{ source: string; content: string; isNew: boolean }[]> {
  const fetchers: Record<string, () => Promise<string>> = {
    company_ir: () => fetchIRPage(companyId),
    edinet: () => fetchEdinet(companyId),
    reuters_nikkei: () => fetchNews(companyName, ticker),
    twitter: () => fetchTwitter(companyName, ticker),
    tradingview: () => fetchPrice(companyName, ticker),
    industry: () => fetchIndustry(companyName, sector),
    reddit: () => fetchReddit(companyName, ticker),
  };

  const results: { source: string; content: string; isNew: boolean }[] = [];

  // Separate into direct fetchers (no Claude API) and web search fetchers (use Claude API)
  const directSources = ["company_ir", "edinet"];
  const webSearchSources = ["reuters_nikkei", "twitter", "tradingview", "industry", "reddit"];

  async function fetchAndStore(source: string) {
    try {
      const content = await fetchers[source]();
      const contentHash = hashContent(content);
      const lastSweep = await getLatestSweepData(companyId, source);
      const isNew = !lastSweep || lastSweep.content_hash !== contentHash;

      await insertSweepData({
        companyId,
        source,
        contentHash,
        content: content.slice(0, 50000),
        isNew,
      });

      // Truncate content for analysis context to manage token usage
      results.push({ source, content: content.slice(0, 4000), isNew });
    } catch (error) {
      results.push({
        source,
        content: `Error fetching ${source}: ${error instanceof Error ? error.message : String(error)}`,
        isNew: false,
      });
    }
  }

  // Run direct fetchers in parallel (no API rate limit concerns)
  const directActive = enabledSources
    .filter((s) => directSources.includes(s) && fetchers[s])
    .map(fetchAndStore);
  await Promise.all(directActive);

  // Run web search fetchers sequentially with delays to respect rate limits
  const webActive = enabledSources.filter(
    (s) => webSearchSources.includes(s) && fetchers[s]
  );
  for (const source of webActive) {
    await fetchAndStore(source);
    // Small delay between web search calls to stay within rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return results;
}

/**
 * Run a sweep for a single company.
 */
async function sweepCompany(companyId: string): Promise<SweepLog> {
  const start = Date.now();

  try {
    const company = await getCompany(companyId);
    if (!company) {
      return {
        companyId,
        companyName: companyId,
        status: "error",
        error: "Company not found",
        durationMs: Date.now() - start,
      };
    }

    const profile = company.profile_json as {
      thesis: string;
      key_assumptions: string[];
      risk_factors: string[];
      narrative?: Record<string, string> | null;
      outlook?: Record<string, string> | null;
    };
    const criteria = company.sweep_criteria_json as {
      sources: string[];
      focus: string[];
    };

    // Step 1: Fetch data from all sources
    const fetchedData = await fetchAllSources(
      companyId,
      company.name,
      company.ticker_full,
      company.sector,
      criteria.sources
    );

    // Try to extract and update market cap from price data
    const priceData = fetchedData.find((d) => d.source === "tradingview");
    if (priceData?.content) {
      try {
        const mcMatch = priceData.content.match(/market\s*cap[:\s]*\$?([\d,.]+)\s*(trillion|billion|T|B)/i);
        if (mcMatch) {
          let mcValue = parseFloat(mcMatch[1].replace(/,/g, ""));
          const unit = mcMatch[2].toLowerCase();
          if (unit === "trillion" || unit === "t") mcValue *= 1000;
          if (mcValue > 0 && mcValue < 100000) {
            await updateCompanyMarketCap(companyId, Math.round(mcValue));
          }
        }
      } catch {
        // Non-critical
      }
    }

    // Fetch sector peer context if company has a sector_group
    let sectorPeerFindings: string | undefined;
    const sectorGroup = company.sector_group as string | null;
    if (sectorGroup) {
      try {
        const peerEntries = await getSectorPeerFindings(sectorGroup, companyId);
        if (peerEntries.length > 0) {
          sectorPeerFindings = peerEntries
            .map((e: Record<string, unknown>) => {
              const date = new Date(e.timestamp as string).toISOString().split("T")[0];
              return `${e.company_name} (${date}, ${e.severity}): ${e.summary}`;
            })
            .join("\n");
        }
      } catch {
        // Non-critical — continue without peer context
      }
    }

    // Only send new data to Claude for analysis
    const newData = fetchedData
      .filter((d) => d.isNew)
      .map((d) => ({ source: d.source, content: d.content }));

    // Step 2: Analyze with Claude (includes peer context and narrative/outlook for first-run)
    const sweepResult: SweepResult = await analyzeSweep({
      companyName: company.name,
      ticker: company.ticker_full,
      investmentView: company.investment_view,
      conviction: company.conviction,
      thesis: profile.thesis,
      keyAssumptions: profile.key_assumptions,
      riskFactors: profile.risk_factors,
      sweepFocus: criteria.focus,
      newData,
      sectorPeerFindings,
      currentNarrative: profile.narrative,
      currentOutlook: profile.outlook,
    });

    // Step 3: Map classification to severity
    const severityMap: Record<string, string> = {
      NO_CHANGE: "no_change",
      NOTABLE: "incremental",
      INCREMENTAL: "incremental",
      MATERIAL: "material",
    };
    const severity = severityMap[sweepResult.classification] || "no_change";

    // Step 4: If material, run deep analysis with Opus
    let updatedProfile: Record<string, unknown> | null = null;
    if (sweepResult.classification === "MATERIAL") {
      try {
        const deep = await deepAnalysis({
          companyName: company.name,
          ticker: company.ticker_full,
          materialFinding: sweepResult,
          fullProfile: company.profile_json as Record<string, unknown>,
        });
        updatedProfile = deep.updatedProfile;
      } catch {
        console.error(`Deep analysis failed for ${companyId}, continuing with sweep result`);
      }
    }

    // Step 4b: Handle narrative and outlook updates from sweep response
    const rawResult = sweepResult as unknown as Record<string, unknown>;
    const narrativeUpdates = rawResult.narrative_updates as Record<string, string> | null;
    const outlookUpdates = rawResult.outlook_updates as Record<string, string> | null;

    if (narrativeUpdates || outlookUpdates) {
      // Merge narrative/outlook into profile — either the deep-updated profile or the current one
      const baseProfile = (updatedProfile || company.profile_json) as Record<string, unknown>;
      if (narrativeUpdates) {
        baseProfile.narrative = narrativeUpdates;
      }
      if (outlookUpdates) {
        baseProfile.outlook = outlookUpdates;
      }
      updatedProfile = baseProfile;
    }

    // Step 5: Write to action log
    await insertActionLog({
      companyId,
      severity,
      summary: sweepResult.summary,
      detailJson: sweepResult.detail as Record<string, unknown> | null,
      sourcesChecked: criteria.sources,
      rawAiResponse: JSON.stringify(sweepResult),
    });

    // Step 6: Update company record
    await updateCompanyAfterSweep(companyId, {
      profileJson: updatedProfile || undefined,
      isMaterial: severity === "material",
    });

    return {
      companyId,
      companyName: company.name,
      status: "success",
      classification: sweepResult.classification,
      summary: sweepResult.summary,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    // Log the error to the action log
    try {
      await insertActionLog({
        companyId,
        severity: "no_change",
        summary: `Sweep error: ${error instanceof Error ? error.message : String(error)}`,
        detailJson: null,
        sourcesChecked: [],
        rawAiResponse: "",
      });
    } catch {
      // Ignore logging failure
    }

    return {
      companyId,
      companyName: companyId,
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - start,
    };
  }
}

/**
 * Run sweeps for all companies, or a specific company.
 * Companies are processed sequentially to manage API rate limits.
 */
export async function runSweep(companyId?: string): Promise<SweepLog[]> {
  if (companyId) {
    const result = await sweepCompany(companyId);
    return [result];
  }

  const companies = await getCompanies();
  const results: SweepLog[] = [];

  for (const company of companies) {
    const result = await sweepCompany(company.id);
    results.push(result);
  }

  return results;
}

/**
 * Run sweeps for a specific batch of company IDs.
 * Used by staggered cron jobs — each batch runs ~4 companies within
 * the 5-minute serverless function timeout.
 */
export async function runSweepBatch(companyIds: string[]): Promise<SweepLog[]> {
  const results: SweepLog[] = [];

  for (const id of companyIds) {
    const result = await sweepCompany(id);
    results.push(result);
  }

  return results;
}
