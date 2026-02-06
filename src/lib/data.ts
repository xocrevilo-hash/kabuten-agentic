import seedData from "../../data/seed.json";

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
  sector: string;
  profile_json: {
    overview: string;
    thesis: string;
    key_assumptions: string[];
    risk_factors: string[];
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

export async function fetchActionLog(companyId?: string): Promise<ActionLogEntry[]> {
  if (!process.env.DATABASE_URL) {
    return getSeedActionLog(companyId);
  }
  try {
    const { getActionLog } = await import("@/lib/db");
    const rows = await getActionLog(companyId);
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
  const c = seedData.companies.find((c) => c.id === id);
  return c ? toCompany(c) : null;
}

function getSeedActionLog(companyId?: string): ActionLogEntry[] {
  const companyMap = Object.fromEntries(
    seedData.companies.map((c) => [c.id, c.name])
  );
  let logs = seedData.action_log;
  if (companyId) {
    logs = logs.filter((l) => l.company_id === companyId);
  }
  return logs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((l, i) => ({
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

function toCompany(c: (typeof seedData.companies)[number]): Company {
  return {
    id: c.id,
    name: c.name,
    name_jp: c.name_jp,
    ticker_full: c.ticker_full,
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
