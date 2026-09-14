import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { ceremonyTypes } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(ceremonyTypes).orderBy(asc(ceremonyTypes.sort));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const [row] = await db
    .insert(ceremonyTypes)
    .values({ name, active: body.active !== false, sort: Number.isFinite(Number(body.sort)) ? Number(body.sort) : 0 })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
