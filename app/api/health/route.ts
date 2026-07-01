import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/turso";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, db: getDb() !== null });
}
