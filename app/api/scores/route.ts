import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db/turso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SCORE_PER_SECOND = 45; // generous plausibility ceiling, not a hard skill cap
const MAX_NAME_LEN = 20;
const MAX_SCORE = 200_000;

function isValidDay(day: unknown): day is string {
  return typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day);
}

export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return NextResponse.json({ entries: [], unavailable: true });
  await ensureSchema(db);

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") === "daily" ? "daily" : "endless";
  const day = searchParams.get("day");

  const result =
    mode === "daily" && isValidDay(day)
      ? await db.execute({
          sql: "SELECT name, score, device_id, created_at FROM scores WHERE mode = 'daily' AND day = ? ORDER BY score DESC LIMIT 50",
          args: [day],
        })
      : await db.execute({
          sql: "SELECT name, score, device_id, created_at FROM scores WHERE mode = 'endless' ORDER BY score DESC LIMIT 50",
          args: [],
        });

  return NextResponse.json({ entries: result.rows });
}

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, unavailable: true }, { status: 202 });
  await ensureSchema(db);

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });

  const { mode, score, name, deviceId, elapsedSec, day } = body as {
    mode?: string;
    score?: number;
    name?: string;
    deviceId?: string;
    elapsedSec?: number;
    day?: string;
  };

  if (mode !== "daily" && mode !== "endless") {
    return NextResponse.json({ ok: false, error: "invalid mode" }, { status: 400 });
  }
  if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > MAX_SCORE) {
    return NextResponse.json({ ok: false, error: "invalid score" }, { status: 400 });
  }
  if (typeof deviceId !== "string" || deviceId.length < 4 || deviceId.length > 64) {
    return NextResponse.json({ ok: false, error: "invalid device" }, { status: 400 });
  }
  const safeName = (typeof name === "string" && name.trim() ? name.trim() : "Anonymous").slice(0, MAX_NAME_LEN);
  const safeElapsed = typeof elapsedSec === "number" && elapsedSec > 0 ? elapsedSec : 1;

  // Plausibility check: reject scores that would require an impossible
  // sustained scoring rate for the reported run duration.
  if (score > safeElapsed * MAX_SCORE_PER_SECOND) {
    return NextResponse.json({ ok: false, error: "implausible score" }, { status: 422 });
  }

  if (mode === "daily") {
    if (!isValidDay(day)) return NextResponse.json({ ok: false, error: "invalid day" }, { status: 400 });
    await db.execute({
      sql: `INSERT INTO scores (mode, day, name, score, device_id) VALUES ('daily', ?, ?, ?, ?)
            ON CONFLICT(mode, day, device_id) DO UPDATE SET score = excluded.score, name = excluded.name
            WHERE excluded.score > scores.score`,
      args: [day, safeName, score, deviceId],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO scores (mode, day, name, score, device_id) VALUES ('endless', NULL, ?, ?, ?)`,
      args: [safeName, score, deviceId],
    });
  }

  return NextResponse.json({ ok: true });
}
