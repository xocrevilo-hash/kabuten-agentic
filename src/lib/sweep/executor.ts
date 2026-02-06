import { getCompanies, getCompany, insertActionLog, updateCompanyAfterSweep, insertSweepData, getLatestSweepData } from "@/lib/db";
import { analyzeSweep, deepAnalysis, type SweepResult } from "@/lib/claude";
import { fetchIRPage } from "./fetchers/ir-page";
import { fetchNews } from "./fetchers/news";
import { fetchTwitter } from "./fetchers/twitter";
import { fetchPrice } from "./fetchers/price";
import { fetchIndustry } from "./fetchers/industry";
import { fetchEdinet } from "./fetchers/edinet";
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
  };

  const results: { source: string; content: string; isNew: boolean }[] = [];

  // Run enabled fetchers in parallel
  const activeFetchers = enabledSources
    .filter((s) => fetchers[s])
    .map(async (source) => {
      try {
        const content = await fetchers[source]();
        const contentHash = hashContent(content);

        // Check if content is new compared to last sweep
        const lastSweep = await getLatestSweepData(companyId, source);
        const isNew = !lastSweep || lastSweep.content_hash !== contentHash;

        // Store the sweep data
        await insertSweepData({
          companyId,
          source,
          contentHash,
          content: content.slice(0, 50000), // Cap storage at 50k chars
          isNew,
        });

        results.push({ source, content, isNew });
      } catch (error) {
        results.push({
          source,
          content: `Error fetching ${source}: ${error instanceof Error ? error.message : String(error)}`,
          isNew: false,
        });
      }
    });

  await Promise.all(activeFetchers);
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

    // Only send new data to Claude for analysis
    const newData = fetchedData
      .filter((d) => d.isNew)
      .map((d) => ({ source: d.source, content: d.content }));

    // Step 2: Analyze with Claude
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
    });

    // Step 3: Map classification to severity
    const severityMap: Record<string, string> = {
      NO_CHANGE: "no_change",
      NOTABLE: "notable",
      MATERIAL: "material",
    };
    const severity = severityMap[sweepResult.classification] || "no_change";

    // Step 4: If material, run deep analysis with Opus
    let updatedProfile = null;
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
        // Deep analysis failure shouldn't block the sweep
        console.error(`Deep analysis failed for ${companyId}, continuing with sweep result`);
      }
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
