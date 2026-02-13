import seedDataRaw from "../../data/seed.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const seedData = seedDataRaw as any;

// Types matching our database schema
export interface EarningsRow {
  period: string;
  revenue: string;
  operatingProfit: string;
  netProfit: string;
  eps: string;
  isEstimate?: boolean;
}

export interface Segment {
  name: string;
  revenue: string;
  share: string;
}

export interface ValuationMetric {
  label: string;
  current: string;
  sectorAvg?: string;
}

export interface ValuationScenario {
  label: string;
  targetPrice: string;
  methodology: string;
  upside: string;
}

export interface Company {
  id: string;
  name: string;
  name_jp: string;
  ticker_full: string;
  exchange: string;
  country: string;
  classification: string;
  market_cap_usd: number | null;
  benchmark_index: string;
  sector: string;
  profile_json: {
    overview: string;
    thesis: string;
    key_assumptions: string[];
    risk_factors: string[];
    investment_view_detail?: {
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
    };
    earnings?: EarningsRow[];
    segments?: Segment[];
    valuation_metrics?: ValuationMetric[];
    valuation_scenarios?: ValuationScenario[];
    current_price?: string;
    fair_value?: string;
    valuation_notes?: string;
  };
  sweep_criteria_json: {
    sources: string[];
    focus: string[];
  };
  investment_view: string;
  conviction: string;
  last_sweep_at: string | null;
  last_material_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionLogEntry {
  id: number;
  company_id: string;
  company_name: string;
  timestamp: string;
  severity: string;
  summary: string;
  detail_json: {
    what_happened?: string;
    why_it_matters?: string;
    recommended_action?: string;
    confidence?: string;
    sources?: string[];
  } | null;
  sources_checked: string[];
}

// Fetch with database, fall back to seed data
export async function fetchCompanies(): Promise<Company[]> {
  if (!process.env.DATABASE_URL) {
    return getSeedCompanies();
  }
  try {
    const { getCompanies } = await import("@/lib/db");
    const rows = await getCompanies();
    if (rows.length === 0) return getSeedCompanies();
    return rows as unknown as Company[];
  } catch {
    return getSeedCompanies();
  }
}

export async function fetchCompany(id: string): Promise<Company | null> {
  if (!process.env.DATABASE_URL) {
    return getSeedCompany(id);
  }
  try {
    const { getCompany } = await import("@/lib/db");
    const row = await getCompany(id);
    if (!row) return getSeedCompany(id);
    return row as unknown as Company;
  } catch {
    return getSeedCompany(id);
  }
}

export async function fetchActionLog(companyId?: string, limit = 20): Promise<ActionLogEntry[]> {
  if (!process.env.DATABASE_URL) {
    return getSeedActionLog(companyId);
  }
  try {
    const { getActionLog } = await import("@/lib/db");
    const rows = await getActionLog(companyId, limit);
    if (rows.length === 0) return getSeedActionLog(companyId);
    return rows as unknown as ActionLogEntry[];
  } catch {
    return getSeedActionLog(companyId);
  }
}

// Seed data helpers
function getSeedCompanies(): Company[] {
  return seedData.companies.map(toCompany);
}

function getSeedCompany(id: string): Company | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = seedData.companies.find((c: any) => c.id === id);
  return c ? toCompany(c) : null;
}

function getSeedActionLog(companyId?: string): ActionLogEntry[] {
  const companyMap = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seedData.companies.map((c: any) => [c.id, c.name])
  );
  let logs = seedData.action_log || [];
  if (companyId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logs = logs.filter((l: any) => l.company_id === companyId);
  }
  return logs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((l: any, i: number) => ({
      id: i + 1,
      company_id: l.company_id,
      company_name: companyMap[l.company_id] || l.company_id,
      timestamp: l.timestamp,
      severity: l.severity,
      summary: l.summary,
      detail_json: l.detail_json || null,
      sources_checked: l.sources_checked,
    }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCompany(c: any): Company {
  return {
    id: c.id,
    name: c.name,
    name_jp: c.name_jp,
    ticker_full: c.ticker_full,
    exchange: c.exchange || "",
    country: c.country || "",
    classification: c.classification || "",
    market_cap_usd: c.market_cap_usd || null,
    benchmark_index: c.benchmark_index || "",
    sector: c.sector,
    profile_json: c.profile_json,
    sweep_criteria_json: c.sweep_criteria_json,
    investment_view: c.investment_view,
    conviction: c.conviction,
    last_sweep_at: "2026-02-06T07:15:00Z",
    last_material_at: c.investment_view === "bullish" ? "2026-02-06T07:15:00Z" : null,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-06T07:15:00Z",
  };
}
