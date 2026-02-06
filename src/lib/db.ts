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
