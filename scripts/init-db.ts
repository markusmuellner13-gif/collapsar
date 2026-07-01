import { createClient } from "@libsql/client";
import { SCHEMA_SQL } from "../lib/db/turso";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    console.error("Set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) before running db:init.");
    process.exit(1);
  }
  const db = createClient({ url, authToken });
  const statements = SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await db.execute(stmt);
  }
  console.log("Collapsar: Turso schema ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
