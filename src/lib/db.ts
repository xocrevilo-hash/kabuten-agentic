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
  await sql`ALTER TABLE companies ADD COLUMN IF NOT EXISTS sector_group TEXT`;

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

  // Sector Investment Views table
  await sql`
    CREATE TABLE IF NOT EXISTS sector_views (
      id SERIAL PRIMARY KEY,
      sector_name TEXT NOT NULL UNIQUE,
      stance TEXT DEFAULT 'neutral',
      conviction TEXT DEFAULT 'medium',
      thesis_summary TEXT,
      valuation_assessment JSONB DEFAULT '[]',
      conviction_rationale JSONB DEFAULT '[]',
      key_drivers JSONB DEFAULT '[]',
      key_risks JSONB DEFAULT '[]',
      last_updated TIMESTAMPTZ DEFAULT NOW(),
      last_updated_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Sector Agent Log table
  await sql`
    CREATE TABLE IF NOT EXISTS sector_log (
      id SERIAL PRIMARY KEY,
      sector_name TEXT NOT NULL,
      log_date DATE DEFAULT CURRENT_DATE,
      classification TEXT NOT NULL DEFAULT 'NO_CHANGE',
      summary TEXT NOT NULL,
      related_companies JSONB DEFAULT '[]',
      detail_json JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Sector agent persistent thread histories
  await sql`
    CREATE TABLE IF NOT EXISTS sector_agent_threads (
      sector_key TEXT PRIMARY KEY,
      designation TEXT NOT NULL,
      thread_history JSONB NOT NULL DEFAULT '[]',
      last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_sweep_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_sat_designation ON sector_agent_threads(designation)
  `;

  // Add last_read_at column for unread message tracking
  await sql`ALTER TABLE sector_agent_threads ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ DEFAULT NOW()`;

  // Sector synthesis results (one row per sweep per sector)
  await sql`
    CREATE TABLE IF NOT EXISTS sector_syntheses (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      sector_key TEXT NOT NULL,
      designation TEXT NOT NULL,
      posture TEXT NOT NULL DEFAULT 'neutral',
      conviction REAL NOT NULL DEFAULT 5.0,
      thesis_summary TEXT,
      key_drivers JSONB DEFAULT '[]',
      key_risks JSONB DEFAULT '[]',
      company_signals JSONB,
      material_findings JSONB,
      synthesised_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_ss_sector_key ON sector_syntheses(sector_key)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_ss_synthesised ON sector_syntheses(synthesised_at DESC)
  `;

  // Heatmap results table — written by the daily cron sweep (Claude web search)
  await sql`
    CREATE TABLE IF NOT EXISTS heatmap_results (
      id SERIAL PRIMARY KEY,
      keyword TEXT NOT NULL,
      category TEXT DEFAULT 'uncategorized',
      ticker TEXT,
      score NUMERIC NOT NULL DEFAULT 50,
      colour_hex TEXT NOT NULL DEFAULT '#d1d5db',
      volume INTEGER DEFAULT 0,
      source TEXT DEFAULT 'claude_websearch',
      swept_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (keyword, ticker)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_heatmap_results_swept ON heatmap_results(swept_at DESC)
  `;

  // Seed thread rows for all 17 agents
  const agentSeeds = [
    ['au_enterprise_software', 'APEX'],
    ['china_digital_consumption', 'ORIENT'],
    ['dc_power_cooling', 'VOLT'],
    ['india_it_services', 'INDRA'],
    ['memory_semis', 'HELIX'],
    ['networking_optics', 'PHOTON'],
    ['semi_equipment', 'FORGE'],
    ['ev_supply_chain', 'SURGE'],
    ['china_ai_apps', 'SYNTH'],
    ['china_semis', 'DRAGON'],
    ['japan_materials', 'TERRA'],
    ['gaming', 'PIXEL'],
    ['pcb_supply_chain', 'LAYER'],
    ['asean_ecommerce', 'TIDE'],
    ['ai_semis', 'NOVA'],
    ['mlccs', 'FERRO'],
    ['server_odms', 'RACK'],
  ];
  for (const [key, designation] of agentSeeds) {
    await sql`
      INSERT INTO sector_agent_threads (sector_key, designation)
      VALUES (${key}, ${designation})
      ON CONFLICT (sector_key) DO NOTHING
    `;
  }

  // Sector Briefs table — editable investment mandate per sector agent
  await sql`
    CREATE TABLE IF NOT EXISTS sector_briefs (
      sector_key TEXT PRIMARY KEY,
      bullet_1 TEXT NOT NULL,
      bullet_2 TEXT NOT NULL,
      bullet_3 TEXT NOT NULL,
      bullet_4 TEXT NOT NULL,
      bullet_5 TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed default sector briefs for all 17 sectors (ON CONFLICT DO NOTHING — preserves any edits)
  const briefSeeds: [string, string, string, string, string, string][] = [
    ['au_enterprise_software',
      'Track ARR growth and net revenue retention — the two metrics that determine long-term compounding',
      'Monitor competitive displacement of legacy on-premise systems by SaaS players',
      'Flag any pricing power evidence: seat expansion, ARPU growth, upsell rates',
      'Watch US/global expansion progress — TAM extension is the key re-rating catalyst',
      'Alert on any earnings guidance revision, analyst upgrade cycle, or multiple expansion triggers'],
    ['china_digital_consumption',
      'Track monthly active user trends and monetisation rates across e-commerce and entertainment',
      'Monitor regulatory shifts from Beijing — platform economy rules are the dominant risk factor',
      'Flag any evidence of consumer spending recovery in China\'s domestic economy',
      'Watch competitive dynamics between platforms: who is taking share in AI-native features',
      'Alert on any ADR delisting risk, geopolitical escalation, or US-China trade policy impact'],
    ['dc_power_cooling',
      'Track hyperscaler capex announcements — they are the primary demand signal for power and cooling equipment',
      'Monitor AI data centre buildout pace: rack density increases drive cooling intensity non-linearly',
      'Flag any utility-scale power constraint news — grid bottlenecks are the key sector risk',
      'Watch order backlog and lead time data — supply constraints drive margin expansion',
      'Alert on new product cycles: liquid cooling, direct-to-chip, and high-density UPS adoption curves'],
    ['india_it_services',
      'Track deal TCV (total contract value) and large deal wins — leading indicator of revenue 12-18 months out',
      'Monitor AI services adoption within existing client bases — the key re-rating narrative',
      'Flag rupee/USD FX moves and their margin impact for USD-revenue, INR-cost businesses',
      'Watch headcount and attrition data — execution capacity determines revenue conversion',
      'Alert on US visa policy changes, client budget freeze signals, or vertical-specific slowdowns'],
    ['memory_semis',
      'Track HBM allocation and pricing — AI server demand is driving a structural premium over commodity DRAM',
      'Monitor DRAM and NAND contract price trends — the primary earnings swing factor',
      'Flag any capacity addition announcements: new fabs or technology node transitions affect supply balance',
      'Watch inventory levels across the supply chain — overhang signals are a leading warning indicator',
      'Alert on customer concentration risk (Nvidia, hyperscalers) or geopolitical supply disruption'],
    ['networking_optics',
      'Track hyperscaler fibre and optical transceiver orders — 800G/1.6T adoption is the key growth vector',
      'Monitor silicon photonics adoption curve — this determines which vendors gain structural share',
      'Flag any co-packaged optics (CPO) milestone: a technology transition that reshapes the competitive landscape',
      'Watch capacity utilisation and ASP trends — pricing power confirms genuine demand vs inventory restocking',
      'Alert on any new datacom standard adoption, competitor product launch, or key customer design win'],
    ['semi_equipment',
      'Track WFE (wafer fab equipment) spending guidance from TSMC, Samsung, and Intel — the primary demand driver',
      'Monitor export control developments: US restrictions on China sales are the dominant sector risk',
      'Flag technology inflection points: High-NA EUV ramp, GAA adoption, advanced packaging intensity increases',
      'Watch order book and book-to-bill ratio — leading indicators of revenue 6-12 months ahead',
      'Alert on any capacity expansion announcement, customer fab delay, or competitive displacement news'],
    ['ev_supply_chain',
      'Track EV penetration rates by market: China, Europe, and US are the three key demand theatres',
      'Monitor battery cost per kWh trends — cost parity with ICE is the structural inflection point',
      'Flag any government subsidy change, EV mandate policy, or tariff development in major markets',
      'Watch vertically integrated players (BYD, Tesla) vs supply chain specialists — margin flow matters',
      'Alert on raw material price moves (lithium, cobalt, nickel) and their battery cost pass-through impact'],
    ['china_ai_apps',
      'Track daily/monthly active users and revenue per user — commercial scale is the key validation metric',
      'Monitor foundation model benchmark performance vs US peers — technical parity is the re-rating catalyst',
      'Flag any regulatory development from Beijing\'s AI governance framework — approval cycles affect deployment',
      'Watch gross margin trajectory — inference cost reduction determines path to profitability',
      'Alert on any enterprise contract win, government deployment, or overseas market expansion evidence'],
    ['china_semis',
      'Track domestic chip substitution progress — government mandates are accelerating adoption curves',
      'Monitor US Entity List additions and export control expansions — the dominant sector risk',
      'Flag any technology node advancement: closing the gap with TSMC/Samsung is the structural thesis',
      'Watch government subsidy flows and state-backed capex commitments — funding visibility matters',
      'Alert on any foundry capacity utilisation data, yield improvement milestones, or customer design wins'],
    ['japan_materials',
      'Track semiconductor materials supply tightness — Japan controls critical chokepoints in the global chip supply chain',
      'Monitor export control developments from Japan\'s METI — materials restrictions have global ripple effects',
      'Flag customer inventory drawdown signals — semiconductor materials demand lags equipment by 1-2 quarters',
      'Watch yen moves and their impact on USD-reported margins for Japan-headquartered exporters',
      'Alert on any capacity expansion, new material qualification, or customer concentration shift'],
    ['gaming',
      'Track software title release schedules and attach rates — IP launches are the primary earnings catalyst',
      'Monitor console hardware cycle timing: next-gen transitions create both opportunity and disruption',
      'Flag mobile gaming monetisation trends — in-app purchase and live service revenue are the recurring base',
      'Watch AI-assisted game development adoption — cost reduction and release cadence improvement',
      'Alert on any major studio acquisition, competitive platform shift, or regulatory change on loot boxes/monetisation'],
    ['pcb_supply_chain',
      'Track AI server PCB and IC substrate order volumes — this is the highest-value tier of the supply chain',
      'Monitor substrate technology transitions: ABF (Ajinomoto Build-up Film) capacity is the bottleneck',
      'Flag customer concentration risk — a handful of hyperscalers and chipmakers dominate demand',
      'Watch lead times and ASP trends for high-layer-count PCBs — pricing power reflects genuine demand',
      'Alert on any new substrate technology qualification, capacity expansion, or competitive displacement'],
    ['asean_ecommerce',
      'Track GMV growth and take rate expansion — the two levers that compound into earnings power',
      'Monitor path to profitability: both Grab and Sea have moved from growth-at-all-costs to margin discipline',
      'Flag any regional regulatory development, particularly in Indonesia, Thailand, and Vietnam',
      'Watch fintech and digital financial services attach rates — the highest-margin revenue stream in the ecosystem',
      'Alert on competitive pressure from TikTok Shop, Temu, and Chinese cross-border players entering SEA'],
    ['ai_semis',
      'Track AI accelerator demand signals: hyperscaler capex, model training cluster announcements, inference buildout',
      'Monitor custom ASIC adoption (Google TPU, Amazon Trainium, Microsoft Maia) — the key threat to GPU incumbents',
      'Flag any US export control tightening on advanced AI chips — China revenue exposure is a major risk factor',
      'Watch HBM and CoWoS packaging supply constraints — they cap AI chip shipment volumes regardless of demand',
      'Alert on any new architecture announcement, competitive benchmark result, or foundry yield milestone'],
    ['mlccs',
      'Track EV and AI server MLCC content per unit — both are structural demand drivers with multi-year runways',
      'Monitor MLCC pricing cycles — the market is highly cyclical and inventory corrections are sharp',
      'Flag capacity utilisation at Murata and TDK — the two oligopoly leaders set industry pricing',
      'Watch automotive qualification timelines — design wins take 18-24 months to reach revenue',
      'Alert on any commodity pricing move for base metals (nickel, palladium) used in MLCC electrodes'],
    ['server_odms',
      'Track AI server rack assembly volumes and GB200/GB300 NVL rack build rates — the primary growth driver',
      'Monitor customer concentration: Nvidia allocations and hyperscaler direct orders determine revenue visibility',
      'Flag any supply chain bottleneck (HBM, CoWoS, power components) that caps rack shipment capacity',
      'Watch ASP trends for AI vs standard servers — mix shift to AI racks is the key margin expansion driver',
      'Alert on any new hyperscaler vendor qualification, white-box design win, or direct ODM-to-cloud deal'],
  ];

  for (const [key, b1, b2, b3, b4, b5] of briefSeeds) {
    await sql`
      INSERT INTO sector_briefs (sector_key, bullet_1, bullet_2, bullet_3, bullet_4, bullet_5)
      VALUES (${key}, ${b1}, ${b2}, ${b3}, ${b4}, ${b5})
      ON CONFLICT (sector_key) DO NOTHING
    `;
  }

  // Fix Quanta Computer (2382_TW) sector_group — previous seed used wrong ID "2382"
  await sql`
    UPDATE companies
    SET sector_group = 'Server ODMs'
    WHERE id = '2382_TW' AND (sector_group IS NULL OR sector_group != 'Server ODMs')
  `;

  // Ensure rack thread row exists
  await sql`
    INSERT INTO sector_agent_threads (sector_key, designation)
    VALUES ('server_odms', 'RACK')
    ON CONFLICT (sector_key) DO NOTHING
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

    if (sevenDayAvg > 0 && entry.totalViews > 0) {
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

  let keywords = snapshots.map((s: Record<string, unknown>) => ({
    keyword: s.keyword as string,
    category: (s.category || "uncategorized") as string,
    heatScore: (s.heat_score || 50) as number,
    totalViews: ((s.total_views || s.current_views || 0) as number),
    top3Views: (s.top3_views || []) as number[],
    sevenDayAvg: ((s.seven_day_avg || s.avg_7d_views || 0) as number),
    trend: (s.trend || "steady") as string,
    delta: weekAgoMap[s.keyword as string]
      ? Math.round((s.heat_score as number) - weekAgoMap[s.keyword as string])
      : 0,
    scanDate: latestDate,
  }));

  // RELATIVE SCORING: When all 7-day averages are 0 but we have real view data,
  // compute percentile-based scores across today's keywords so the heatmap
  // shows meaningful color differentiation even on the first real scan.
  const allAvgsZero = keywords.every((k) => k.sevenDayAvg === 0);
  const hasRealViews = keywords.some((k) => k.totalViews > 0);
  if (allAvgsZero && hasRealViews) {
    // Use log-scale percentile ranking across today's view counts
    const viewsWithLog = keywords
      .filter((k) => k.totalViews > 0)
      .map((k) => ({ keyword: k.keyword, logViews: Math.log10(k.totalViews + 1) }));

    if (viewsWithLog.length > 0) {
      const logValues = viewsWithLog.map((v) => v.logViews);
      const minLog = Math.min(...logValues);
      const maxLog = Math.max(...logValues);
      const range = maxLog - minLog || 1;

      const logMap: Record<string, number> = {};
      for (const v of viewsWithLog) {
        logMap[v.keyword] = v.logViews;
      }

      keywords = keywords.map((k) => {
        if (k.totalViews <= 0) {
          return { ...k, heatScore: 25, trend: "steady" }; // No views = cold
        }
        // Normalize to 20-95 range using log-scale percentile
        const pct = (logMap[k.keyword] - minLog) / range; // 0..1
        const score = Math.round(20 + pct * 75); // 20..95
        const trend = score >= 55 ? "heating" : score <= 45 ? "cooling" : "steady";
        return { ...k, heatScore: score, trend };
      });

      // Re-sort by heat score descending
      keywords.sort((a, b) => b.heatScore - a.heatScore);
    }
  }

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

/**
 * Upsert a single keyword result into heatmap_results (written by daily cron).
 */
export async function upsertHeatmapResult(entry: {
  keyword: string;
  category: string;
  score: number;
  colourHex: string;
  volume: number;
  source: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO heatmap_results (keyword, category, score, colour_hex, volume, source, swept_at)
    VALUES (
      ${entry.keyword},
      ${entry.category},
      ${entry.score},
      ${entry.colourHex},
      ${entry.volume},
      ${entry.source},
      NOW()
    )
    ON CONFLICT (keyword) DO UPDATE SET
      category   = EXCLUDED.category,
      score      = EXCLUDED.score,
      colour_hex = EXCLUDED.colour_hex,
      volume     = EXCLUDED.volume,
      source     = EXCLUDED.source,
      swept_at   = EXCLUDED.swept_at
  `;
}

/**
 * Get all heatmap_results rows, ordered by score descending.
 * Returns null if the table is empty (caller falls back to heatmap_snapshots).
 */
export async function getLatestHeatmapResults() {
  const sql = getDb();
  const rows = await sql`
    SELECT DISTINCT ON (keyword) *
    FROM heatmap_results
    ORDER BY keyword, swept_at DESC, score DESC
  `;
  // Re-sort by score descending for the heatmap display
  return (rows as Array<Record<string, unknown>>).sort(
    (a, b) => Number(b.score) - Number(a.score)
  );
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

export async function getFilteredActionLog(opts: {
  excludeSeverities?: string[];
  limit?: number;
  offset?: number;
}) {
  const sql = getDb();
  const exclude = opts.excludeSeverities ?? ["no_change"];
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  const [rows, countResult] = await Promise.all([
    sql`
      SELECT al.*, c.name as company_name
      FROM action_log al
      JOIN companies c ON al.company_id = c.id
      WHERE al.severity != ALL(${exclude}::text[])
      ORDER BY al.timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*)::int as total
      FROM action_log al
      WHERE al.severity != ALL(${exclude}::text[])
    `,
  ]);
  return { rows, total: countResult[0].total as number };
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

// ========== Sector DB functions ==========

export async function getSectorView(sectorName: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM sector_views WHERE sector_name = ${sectorName}
  `;
  return rows[0] || null;
}

export async function getAllSectorViews() {
  const sql = getDb();
  return sql`SELECT * FROM sector_views ORDER BY sector_name`;
}

export async function upsertSectorView(entry: {
  sectorName: string;
  stance: string;
  conviction: string;
  thesisSummary: string;
  valuationAssessment: string[];
  convictionRationale: string[];
  keyDrivers: string[];
  keyRisks: string[];
  lastUpdatedReason: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO sector_views (
      sector_name, stance, conviction, thesis_summary,
      valuation_assessment, conviction_rationale, key_drivers, key_risks,
      last_updated, last_updated_reason
    )
    VALUES (
      ${entry.sectorName},
      ${entry.stance},
      ${entry.conviction},
      ${entry.thesisSummary},
      ${JSON.stringify(entry.valuationAssessment)},
      ${JSON.stringify(entry.convictionRationale)},
      ${JSON.stringify(entry.keyDrivers)},
      ${JSON.stringify(entry.keyRisks)},
      NOW(),
      ${entry.lastUpdatedReason}
    )
    ON CONFLICT (sector_name) DO UPDATE SET
      stance = EXCLUDED.stance,
      conviction = EXCLUDED.conviction,
      thesis_summary = EXCLUDED.thesis_summary,
      valuation_assessment = EXCLUDED.valuation_assessment,
      conviction_rationale = EXCLUDED.conviction_rationale,
      key_drivers = EXCLUDED.key_drivers,
      key_risks = EXCLUDED.key_risks,
      last_updated = NOW(),
      last_updated_reason = EXCLUDED.last_updated_reason
  `;
}

export async function getSectorLog(sectorName: string, limit = 50) {
  const sql = getDb();
  return sql`
    SELECT * FROM sector_log
    WHERE sector_name = ${sectorName}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

export async function insertSectorLog(entry: {
  sectorName: string;
  classification: string;
  summary: string;
  relatedCompanies: string[];
  detailJson: Record<string, unknown> | null;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO sector_log (sector_name, log_date, classification, summary, related_companies, detail_json)
    VALUES (
      ${entry.sectorName},
      CURRENT_DATE,
      ${entry.classification},
      ${entry.summary},
      ${JSON.stringify(entry.relatedCompanies)},
      ${entry.detailJson ? JSON.stringify(entry.detailJson) : null}
    )
  `;
}

/**
 * Seed sector_group values for the 49 companies across 7 defined sectors.
 * Safe to run multiple times — uses UPDATE with WHERE.
 */
export async function seedSectorGroups() {
  const sql = getDb();

  const sectorMap: Record<string, string[]> = {
    "Australia Enterprise Software": ["REA", "SEK", "WTC", "XRO", "PME"],
    "China Digital Consumption": ["9988", "BIDU", "NTES", "0700", "TME", "TCOM", "PDD"],
    "Data-centre Power & Cooling": ["3324", "2308", "6501", "VST", "2301"],
    "India IT Services": ["INFY", "TCS", "TECHM", "WIPRO"],
    "Memory Semiconductors": ["285A", "MU", "005930", "SNDK", "STX", "000660", "2408"],
    "Networking & Optics": ["2345", "CLS", "COHR", "FN", "LITE", "300394", "300308", "300502"],
    "Semiconductor Production Equipment": [
      "688082", "6857", "AMAT", "3711", "ASML", "6146", "6361",
      "7741", "KLAC", "6525", "LRCX", "6920", "6323", "7735", "8035", "7729",
      "002371",
    ],
    "EV Supply-chain": ["TSLA", "1211", "300750", "1810", "373220"],
    "China AI Apps": ["0100", "2513"],
    "China Semis": ["688981", "688256", "688041", "603501", "688008"],
    "Japan Materials": ["4004", "3110", "3436", "5016", "4062"],
    "Gaming": ["7974", "6758", "9697", "EA", "TTWO"],
    "PCB Supply-chain": ["007660", "2368", "3037", "1303"],
    "ASEAN E-commerce": ["GRAB", "SE"],
    "AI Semis": ["2330", "NVDA", "AVGO", "AMD", "2454", "MRVL"],
    "MLCCs": ["6981", "6762", "2327", "009150"],
    "Server ODMs": ["2317", "2382_TW", "3231"],
  };

  let totalUpdated = 0;
  for (const [sectorGroup, companyIds] of Object.entries(sectorMap)) {
    for (const companyId of companyIds) {
      await sql`
        UPDATE companies SET sector_group = ${sectorGroup} WHERE id = ${companyId}
      `;
      totalUpdated++;
    }
  }

  return { success: true, companiesUpdated: totalUpdated };
}

/**
 * Get recent Incremental/Material findings from peer companies in the same sector_group.
 * Used for sector peer context injection in sweeps.
 * Returns max 10 entries, prioritising Material over Incremental, newest first.
 */
export async function getSectorPeerFindings(sectorGroup: string, excludeCompanyId: string) {
  const sql = getDb();
  return sql`
    SELECT al.summary, al.severity, al.timestamp, c.name as company_name
    FROM action_log al
    JOIN companies c ON al.company_id = c.id
    WHERE c.sector_group = ${sectorGroup}
    AND al.company_id != ${excludeCompanyId}
    AND al.severity IN ('incremental', 'material')
    AND al.timestamp >= NOW() - INTERVAL '7 days'
    ORDER BY
      CASE WHEN al.severity = 'material' THEN 0 ELSE 1 END,
      al.timestamp DESC
    LIMIT 10
  `;
}

/**
 * Get paginated action log for a specific company (including all severities for full audit trail).
 */
export async function getCompanyActionLogPaginated(companyId: string, limit: number, offset: number) {
  const sql = getDb();
  const [rows, countResult] = await Promise.all([
    sql`
      SELECT al.*, c.name as company_name
      FROM action_log al
      JOIN companies c ON al.company_id = c.id
      WHERE al.company_id = ${companyId}
      ORDER BY al.timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*)::int as total
      FROM action_log
      WHERE company_id = ${companyId}
    `,
  ]);
  return { rows, total: countResult[0].total as number };
}

export async function getTodaySweepResultsForCompanies(companyIds: string[]) {
  const sql = getDb();
  if (companyIds.length === 0) return [];
  return sql`
    SELECT al.*, c.name as company_name
    FROM action_log al
    JOIN companies c ON al.company_id = c.id
    WHERE al.company_id = ANY(${companyIds})
    AND al.timestamp::date = CURRENT_DATE
    ORDER BY al.timestamp DESC
  `;
}

// ========== Sector Agent Thread functions ==========

export async function getAllAgentThreads() {
  const sql = getDb();
  return sql`SELECT * FROM sector_agent_threads ORDER BY designation`;
}

export async function getAgentThread(sectorKey: string) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM sector_agent_threads WHERE sector_key = ${sectorKey}`;
  return rows[0] || null;
}

// Designation map — used by saveAgentThread upsert safety net
const SECTOR_DESIGNATIONS: Record<string, string> = {
  au_enterprise_software: "APEX",
  china_digital_consumption: "ORIENT",
  dc_power_cooling: "VOLT",
  india_it_services: "INDRA",
  memory_semis: "HELIX",
  networking_optics: "PHOTON",
  semi_equipment: "FORGE",
  ev_supply_chain: "SURGE",
  china_ai_apps: "SYNTH",
  china_semis: "DRAGON",
  japan_materials: "TERRA",
  gaming: "PIXEL",
  pcb_supply_chain: "LAYER",
  asean_ecommerce: "TIDE",
  ai_semis: "NOVA",
  mlccs: "FERRO",
  server_odms: "RACK",
};

export async function saveAgentThread(sectorKey: string, threadHistory: unknown[]) {
  const sql = getDb();
  // Upsert: create the row if it doesn't exist yet (e.g. RACK thread seed missing),
  // otherwise update. This prevents silent data loss.
  const designation = SECTOR_DESIGNATIONS[sectorKey] || sectorKey.toUpperCase();
  await sql`
    INSERT INTO sector_agent_threads (sector_key, designation, thread_history, last_updated)
    VALUES (${sectorKey}, ${designation}, ${JSON.stringify(threadHistory)}, NOW())
    ON CONFLICT (sector_key) DO UPDATE SET
      thread_history = EXCLUDED.thread_history,
      last_updated = NOW()
  `;
}

export async function updateAgentSweepTime(sectorKey: string) {
  const sql = getDb();
  await sql`
    UPDATE sector_agent_threads
    SET last_sweep_at = NOW(),
        last_updated = NOW()
    WHERE sector_key = ${sectorKey}
  `;
}

export async function markSectorRead(sectorKey: string) {
  const sql = getDb();
  await sql`
    UPDATE sector_agent_threads
    SET last_read_at = NOW()
    WHERE sector_key = ${sectorKey}
  `;
}

// ========== Sector Synthesis functions ==========

export async function getLatestSynthesis(sectorKey: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM sector_syntheses
    WHERE sector_key = ${sectorKey}
    ORDER BY synthesised_at DESC
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getAllLatestSyntheses() {
  const sql = getDb();
  return sql`
    SELECT DISTINCT ON (sector_key) *
    FROM sector_syntheses
    ORDER BY sector_key, synthesised_at DESC
  `;
}

export async function insertSynthesis(entry: {
  sectorKey: string;
  designation: string;
  posture: string;
  conviction: number;
  thesisSummary: string;
  keyDrivers: string[];
  keyRisks: string[];
  companySignals: unknown;
  materialFindings: unknown;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO sector_syntheses (
      sector_key, designation, posture, conviction,
      thesis_summary, key_drivers, key_risks,
      company_signals, material_findings
    )
    VALUES (
      ${entry.sectorKey},
      ${entry.designation},
      ${entry.posture},
      ${entry.conviction},
      ${entry.thesisSummary},
      ${JSON.stringify(entry.keyDrivers)},
      ${JSON.stringify(entry.keyRisks)},
      ${entry.companySignals ? JSON.stringify(entry.companySignals) : null},
      ${entry.materialFindings ? JSON.stringify(entry.materialFindings) : null}
    )
  `;
}

// ========== Sector Brief functions ==========

export async function getSectorBrief(sectorKey: string) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM sector_briefs WHERE sector_key = ${sectorKey}`;
  return rows[0] || null;
}

export async function upsertSectorBrief(entry: {
  sectorKey: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  bullet4: string;
  bullet5: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO sector_briefs (sector_key, bullet_1, bullet_2, bullet_3, bullet_4, bullet_5, updated_at)
    VALUES (${entry.sectorKey}, ${entry.bullet1}, ${entry.bullet2}, ${entry.bullet3}, ${entry.bullet4}, ${entry.bullet5}, NOW())
    ON CONFLICT (sector_key) DO UPDATE SET
      bullet_1 = EXCLUDED.bullet_1,
      bullet_2 = EXCLUDED.bullet_2,
      bullet_3 = EXCLUDED.bullet_3,
      bullet_4 = EXCLUDED.bullet_4,
      bullet_5 = EXCLUDED.bullet_5,
      updated_at = NOW()
  `;
}
