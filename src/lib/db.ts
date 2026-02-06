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
