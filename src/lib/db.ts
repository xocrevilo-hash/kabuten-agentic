import { neon } from "@neondatabase/serverless";

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(process.env.DATABASE_URL);
}

export async function initializeDatabase() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_jp TEXT,
      ticker_full TEXT NOT NULL,
      sector TEXT,
      profile_json JSONB DEFAULT '{}',
      sweep_criteria_json JSONB DEFAULT '{}',
      investment_view TEXT DEFAULT 'neutral',
      conviction TEXT DEFAULT 'medium',
      last_sweep_at TIMESTAMP,
      last_material_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS action_log (
      id SERIAL PRIMARY KEY,
      company_id TEXT REFERENCES companies(id),
      timestamp TIMESTAMP DEFAULT NOW(),
      severity TEXT NOT NULL DEFAULT 'no_change',
      summary TEXT NOT NULL,
      detail_json JSONB,
      sources_checked JSONB,
      raw_ai_response TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sweep_data (
      id SERIAL PRIMARY KEY,
      company_id TEXT REFERENCES companies(id),
      source TEXT NOT NULL,
      fetched_at TIMESTAMP DEFAULT NOW(),
      content_hash TEXT,
      content TEXT,
      is_new BOOLEAN DEFAULT true
    )
  `;

  // Add new columns for Phase 5
  await sql`ALTER TABLE companies ADD COLUMN IF NOT EXISTS exchange TEXT`;
  await sql`ALTER TABLE companies ADD COLUMN IF NOT EXISTS country TEXT`;
  await sql`ALTER TABLE companies ADD COLUMN IF NOT EXISTS classification TEXT`;
  await sql`ALTER TABLE companies ADD COLUMN IF NOT EXISTS market_cap_usd REAL`;
  await sql`ALTER TABLE companies ADD COLUMN IF NOT EXISTS benchmark_index TEXT`;

  // Phase 5: Podcast episodes table
  await sql`
    CREATE TABLE IF NOT EXISTS podcast_episodes (
      id SERIAL PRIMARY KEY,
      podcast_name TEXT NOT NULL,
      episode_title TEXT,
      episode_date DATE,
      transcript_url TEXT,
      insights_json JSONB,
      status TEXT DEFAULT 'pending',
      processed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Heatmap snapshots table — rebuilt for Chrome MCP X.com scan methodology
  await sql`
    CREATE TABLE IF NOT EXISTS heatmap_snapshots (
      id SERIAL PRIMARY KEY,
      snapshot_date DATE DEFAULT CURRENT_DATE,
      keyword TEXT NOT NULL,
      category TEXT DEFAULT 'uncategorized',
      top_posts_json JSONB,
      top3_views JSONB,
      total_views INTEGER DEFAULT 0,
      current_views INTEGER DEFAULT 0,
      avg_7d_views INTEGER DEFAULT 0,
      seven_day_avg INTEGER DEFAULT 0,
      heat_score REAL DEFAULT 50,
      trend TEXT DEFAULT 'steady',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_heatmap_date_keyword
    ON heatmap_snapshots (snapshot_date, keyword)
  `;
  // Add new columns if table already exists from earlier version
  await sql`ALTER TABLE heatmap_snapshots ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'uncategorized'`;
  await sql`ALTER TABLE heatmap_snapshots ADD COLUMN IF NOT EXISTS top3_views JSONB`;
  await sql`ALTER TABLE heatmap_snapshots ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0`;
  await sql`ALTER TABLE heatmap_snapshots ADD COLUMN IF NOT EXISTS seven_day_avg INTEGER DEFAULT 0`;

  // Phase 5: Portfolio holdings table
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_holdings (
      id SERIAL PRIMARY KEY,
      company_id TEXT REFERENCES companies(id),
      entry_date DATE NOT NULL,
      entry_price_local REAL,
      entry_fx_rate REAL DEFAULT 1.0,
      entry_price_usd REAL,
      initial_weight REAL DEFAULT 0.05,
      exit_date DATE,
      exit_price_local REAL,
      exit_price_usd REAL,
      exit_reason TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Phase 5: Portfolio snapshots table
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_snapshots (
      id SERIAL PRIMARY KEY,
      snapshot_date DATE NOT NULL,
      nav REAL DEFAULT 100.0,
      daily_return REAL DEFAULT 0.0,
      holdings_json JSONB,
      kabuten_view TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Phase 5: Portfolio changes table
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_changes (
      id SERIAL PRIMARY KEY,
      change_date DATE NOT NULL,
      action TEXT NOT NULL,
      company_id TEXT REFERENCES companies(id),
      reason TEXT,
      price_local REAL,
      price_usd REAL,
      weight REAL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Ask Kabuten question history table
  await sql`
    CREATE TABLE IF NOT EXISTS ask_kabuten_log (
      id SERIAL PRIMARY KEY,
      query TEXT NOT NULL,
      answer TEXT NOT NULL,
      source TEXT DEFAULT 'kabuten',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  return { success: true };
}

export async function getCompanies() {
  const sql = getDb();
  const rows = await sql`SELECT * FROM companies ORDER BY id`;
  return rows;
}

export async function getCompany(id: string) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM companies WHERE id = ${id}`;
  return rows[0] || null;
}

export async function updateCompanyMarketCap(id: string, marketCapUsd: number) {
  const sql = getDb();
  await sql`
    UPDATE companies SET market_cap_usd = ${marketCapUsd} WHERE id = ${id}
  `;
}

export async function insertActionLog(entry: {
  companyId: string;
  severity: string;
  summary: string;
  detailJson: Record<string, unknown> | null;
  sourcesChecked: string[];
  rawAiResponse: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO action_log (company_id, timestamp, severity, summary, detail_json, sources_checked, raw_ai_response)
    VALUES (
      ${entry.companyId},
      NOW(),
      ${entry.severity},
      ${entry.summary},
      ${entry.detailJson ? JSON.stringify(entry.detailJson) : null},
      ${JSON.stringify(entry.sourcesChecked)},
      ${entry.rawAiResponse}
    )
  `;
}

export async function updateCompanyAfterSweep(
  companyId: string,
  updates: {
    profileJson?: Record<string, unknown>;
    investmentView?: string;
    conviction?: string;
    isMaterial?: boolean;
  }
) {
  const sql = getDb();

  if (updates.profileJson) {
    await sql`
      UPDATE companies
      SET profile_json = ${JSON.stringify(updates.profileJson)},
          investment_view = COALESCE(${updates.investmentView || null}, investment_view),
          conviction = COALESCE(${updates.conviction || null}, conviction),
          last_sweep_at = NOW(),
          last_material_at = CASE WHEN ${updates.isMaterial || false} THEN NOW() ELSE last_material_at END,
          updated_at = NOW()
      WHERE id = ${companyId}
    `;
  } else {
    await sql`
      UPDATE companies
      SET last_sweep_at = NOW(),
          last_material_at = CASE WHEN ${updates.isMaterial || false} THEN NOW() ELSE last_material_at END,
          updated_at = NOW()
      WHERE id = ${companyId}
    `;
  }
}

export async function insertSweepData(entry: {
  companyId: string;
  source: string;
  contentHash: string;
  content: string;
  isNew: boolean;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO sweep_data (company_id, source, content_hash, content, is_new)
    VALUES (${entry.companyId}, ${entry.source}, ${entry.contentHash}, ${entry.content}, ${entry.isNew})
  `;
}

export async function getLatestSweepData(companyId: string, source: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT content_hash FROM sweep_data
    WHERE company_id = ${companyId} AND source = ${source}
    ORDER BY fetched_at DESC
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function updateSweepCriteria(
  companyId: string,
  criteria: { sources: string[]; focus: string[] }
) {
  const sql = getDb();
  await sql`
    UPDATE companies
    SET sweep_criteria_json = ${JSON.stringify(criteria)},
        updated_at = NOW()
    WHERE id = ${companyId}
  `;
}

// ========== Podcast DB functions ==========

export async function getPodcastEpisodes(limit = 50) {
  const sql = getDb();
  return sql`
    SELECT * FROM podcast_episodes
    ORDER BY processed_at DESC NULLS LAST, created_at DESC
    LIMIT ${limit}
  `;
}

export async function insertPodcastEpisode(entry: {
  podcastName: string;
  episodeTitle: string;
  episodeDate: string | null;
  transcriptUrl: string | null;
  insightsJson: unknown;
  status: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO podcast_episodes (podcast_name, episode_title, episode_date, transcript_url, insights_json, status, processed_at)
    VALUES (
      ${entry.podcastName},
      ${entry.episodeTitle},
      ${entry.episodeDate},
      ${entry.transcriptUrl},
      ${JSON.stringify(entry.insightsJson)},
      ${entry.status},
      NOW()
    )
  `;
}

// ========== Heatmap DB functions ==========

export async function getHeatmapSnapshots(date?: string) {
  const sql = getDb();
  if (date) {
    return sql`
      SELECT * FROM heatmap_snapshots
      WHERE snapshot_date = ${date}
      ORDER BY heat_score DESC
    `;
  }
  // Get latest snapshot date's data
  return sql`
    SELECT * FROM heatmap_snapshots
    WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM heatmap_snapshots)
    ORDER BY heat_score DESC
  `;
}

export async function insertHeatmapSnapshot(entry: {
  keyword: string;
  topPostsJson: unknown;
  currentViews: number;
  avg7dViews: number;
  heatScore: number;
  trend: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO heatmap_snapshots (snapshot_date, keyword, top_posts_json, current_views, avg_7d_views, heat_score, trend)
    VALUES (
      CURRENT_DATE,
      ${entry.keyword},
      ${JSON.stringify(entry.topPostsJson)},
      ${entry.currentViews},
      ${entry.avg7dViews},
      ${entry.heatScore},
      ${entry.trend}
    )
    ON CONFLICT (snapshot_date, keyword)
    DO UPDATE SET
      top_posts_json = EXCLUDED.top_posts_json,
      current_views = EXCLUDED.current_views,
      avg_7d_views = EXCLUDED.avg_7d_views,
      heat_score = EXCLUDED.heat_score,
      trend = EXCLUDED.trend,
      created_at = NOW()
  `;
}

/**
 * Record a single keyword scan result from Chrome MCP X.com scan.
 * Computes heat score using 7-day rolling average comparison.
 */
export async function recordHeatmapKeyword(entry: {
  keyword: string;
  category: string;
  totalViews: number;
  top3Views: number[];
}) {
  const sql = getDb();

  // Get 7-day history for this keyword
  const history = await sql`
    SELECT total_views FROM heatmap_snapshots
    WHERE keyword = ${entry.keyword}
    AND snapshot_date >= CURRENT_DATE - 7
    AND snapshot_date < CURRENT_DATE
    ORDER BY snapshot_date DESC
  `;

  let sevenDayAvg = 0;
  let heatScore = 50; // Default during baseline period
  let trend = "steady";

  if (history.length >= 1) {
    // Calculate 7-day average
    sevenDayAvg = Math.round(
      history.reduce((sum: number, h: Record<string, unknown>) => sum + ((h.total_views as number) || 0), 0) / history.length
    );

    if (sevenDayAvg > 0) {
      const ratio = entry.totalViews / sevenDayAvg;
      // Formula from architecture doc
      heatScore = Math.min(100, Math.max(0, Math.round(50 + (ratio - 1) * 45)));
      trend = heatScore >= 55 ? "heating" : heatScore <= 45 ? "cooling" : "steady";
    }
  }

  await sql`
    INSERT INTO heatmap_snapshots (
      snapshot_date, keyword, category, top3_views, total_views,
      current_views, avg_7d_views, seven_day_avg, heat_score, trend
    )
    VALUES (
      CURRENT_DATE,
      ${entry.keyword},
      ${entry.category},
      ${JSON.stringify(entry.top3Views)},
      ${entry.totalViews},
      ${entry.totalViews},
      ${sevenDayAvg},
      ${sevenDayAvg},
      ${heatScore},
      ${trend}
    )
    ON CONFLICT (snapshot_date, keyword)
    DO UPDATE SET
      category = EXCLUDED.category,
      top3_views = EXCLUDED.top3_views,
      total_views = EXCLUDED.total_views,
      current_views = EXCLUDED.current_views,
      avg_7d_views = EXCLUDED.avg_7d_views,
      seven_day_avg = EXCLUDED.seven_day_avg,
      heat_score = EXCLUDED.heat_score,
      trend = EXCLUDED.trend,
      created_at = NOW()
  `;

  return { keyword: entry.keyword, heatScore, sevenDayAvg, trend };
}

/**
 * Get heatmap results with computed scores for all keywords on the latest scan date.
 */
export async function getHeatmapResults() {
  const sql = getDb();

  // Get the latest scan date
  const latestRows = await sql`
    SELECT MAX(snapshot_date) as latest_date, COUNT(DISTINCT snapshot_date) as total_days
    FROM heatmap_snapshots
  `;
  const latestDate = latestRows[0]?.latest_date;
  const totalDays = latestRows[0]?.total_days || 0;

  if (!latestDate) return { keywords: [], lastScan: null, totalDays: 0, isBaseline: true };

  // Get all keywords for latest date
  const snapshots = await sql`
    SELECT * FROM heatmap_snapshots
    WHERE snapshot_date = ${latestDate}
    ORDER BY heat_score DESC
  `;

  // For delta calculation, get scores from 7 days ago
  const weekAgo = await sql`
    SELECT keyword, heat_score FROM heatmap_snapshots
    WHERE snapshot_date = ${latestDate}::date - 7
  `;
  const weekAgoMap: Record<string, number> = {};
  for (const row of weekAgo) {
    weekAgoMap[row.keyword as string] = row.heat_score as number;
  }

  const keywords = snapshots.map((s: Record<string, unknown>) => ({
    keyword: s.keyword,
    category: s.category || "uncategorized",
    heatScore: s.heat_score || 50,
    totalViews: s.total_views || s.current_views || 0,
    top3Views: s.top3_views || [],
    sevenDayAvg: s.seven_day_avg || s.avg_7d_views || 0,
    trend: s.trend || "steady",
    delta: weekAgoMap[s.keyword as string]
      ? Math.round((s.heat_score as number) - weekAgoMap[s.keyword as string])
      : 0,
    scanDate: latestDate,
  }));

  return {
    keywords,
    lastScan: snapshots[0]?.created_at || null,
    totalDays: Number(totalDays),
    isBaseline: Number(totalDays) < 7,
  };
}

/**
 * Get count of distinct scan dates (for baseline tracking).
 */
export async function getHeatmapDayCount() {
  const sql = getDb();
  const rows = await sql`
    SELECT COUNT(DISTINCT snapshot_date) as count FROM heatmap_snapshots
  `;
  return rows[0]?.count || 0;
}

export async function getHeatmapHistory(keyword: string, days = 7) {
  const sql = getDb();
  return sql`
    SELECT * FROM heatmap_snapshots
    WHERE keyword = ${keyword}
    AND snapshot_date >= CURRENT_DATE - ${days}
    ORDER BY snapshot_date DESC
  `;
}

// ========== Portfolio DB functions ==========

export async function getPortfolioHoldings(activeOnly = true) {
  const sql = getDb();
  if (activeOnly) {
    return sql`
      SELECT ph.*, c.name as company_name, c.ticker_full, c.conviction, c.investment_view
      FROM portfolio_holdings ph
      JOIN companies c ON ph.company_id = c.id
      WHERE ph.is_active = true
      ORDER BY ph.initial_weight DESC
    `;
  }
  return sql`
    SELECT ph.*, c.name as company_name, c.ticker_full, c.conviction, c.investment_view
    FROM portfolio_holdings ph
    JOIN companies c ON ph.company_id = c.id
    ORDER BY ph.is_active DESC, ph.entry_date ASC
  `;
}

export async function insertPortfolioHolding(entry: {
  companyId: string;
  entryDate: string;
  entryPriceLocal: number | null;
  entryFxRate: number;
  entryPriceUsd: number | null;
  initialWeight: number;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO portfolio_holdings (company_id, entry_date, entry_price_local, entry_fx_rate, entry_price_usd, initial_weight)
    VALUES (
      ${entry.companyId},
      ${entry.entryDate},
      ${entry.entryPriceLocal},
      ${entry.entryFxRate},
      ${entry.entryPriceUsd},
      ${entry.initialWeight}
    )
  `;
}

export async function getPortfolioSnapshots(limit = 30) {
  const sql = getDb();
  return sql`
    SELECT * FROM portfolio_snapshots
    ORDER BY snapshot_date DESC
    LIMIT ${limit}
  `;
}

export async function insertPortfolioSnapshot(entry: {
  snapshotDate: string;
  nav: number;
  dailyReturn: number;
  holdingsJson: unknown;
  kabutenView: string | null;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO portfolio_snapshots (snapshot_date, nav, daily_return, holdings_json, kabuten_view)
    VALUES (
      ${entry.snapshotDate},
      ${entry.nav},
      ${entry.dailyReturn},
      ${JSON.stringify(entry.holdingsJson)},
      ${entry.kabutenView}
    )
  `;
}

export async function getPortfolioChanges(limit = 50) {
  const sql = getDb();
  return sql`
    SELECT pc.*, c.name as company_name, c.ticker_full
    FROM portfolio_changes pc
    JOIN companies c ON pc.company_id = c.id
    ORDER BY pc.change_date DESC, pc.created_at DESC
    LIMIT ${limit}
  `;
}

export async function insertPortfolioChange(entry: {
  changeDate: string;
  action: string;
  companyId: string;
  reason: string;
  priceLocal: number | null;
  priceUsd: number | null;
  weight: number;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO portfolio_changes (change_date, action, company_id, reason, price_local, price_usd, weight)
    VALUES (
      ${entry.changeDate},
      ${entry.action},
      ${entry.companyId},
      ${entry.reason},
      ${entry.priceLocal},
      ${entry.priceUsd},
      ${entry.weight}
    )
  `;
}

export async function getActionLog(companyId?: string, limit = 20) {
  const sql = getDb();
  if (companyId) {
    return sql`
      SELECT al.*, c.name as company_name
      FROM action_log al
      JOIN companies c ON al.company_id = c.id
      WHERE al.company_id = ${companyId}
      ORDER BY al.timestamp DESC
      LIMIT ${limit}
    `;
  }
  return sql`
    SELECT al.*, c.name as company_name
    FROM action_log al
    JOIN companies c ON al.company_id = c.id
    ORDER BY al.timestamp DESC
    LIMIT ${limit}
  `;
}

// ========== Ask Kabuten Log functions ==========

export async function getAskKabutenLog(limit = 30) {
  const sql = getDb();
  return sql`
    SELECT * FROM ask_kabuten_log
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

export async function insertAskKabutenLog(entry: {
  query: string;
  answer: string;
  source: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO ask_kabuten_log (query, answer, source)
    VALUES (${entry.query}, ${entry.answer}, ${entry.source})
  `;
}
