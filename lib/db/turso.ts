import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

// Returns null (rather than throwing) when Turso credentials aren't
// configured yet, so the game stays fully playable before the leaderboard
// is wired up — API routes fall back to an empty/"unavailable" response.
export function getDb(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) return null;
  if (!client) {
    client = createClient({ url, authToken });
  }
  return client;
}

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode TEXT NOT NULL CHECK (mode IN ('daily','endless')),
  day TEXT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_scores_mode_day_score ON scores (mode, day, score DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_daily_device ON scores (mode, day, device_id) WHERE mode = 'daily';
`;

export async function ensureSchema(db: Client) {
  const statements = SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await db.execute(stmt);
  }
}
