import { NextResponse } from "next/server";
import { desc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const status = url.searchParams.get("status") || "";

  const conditions = [];
  if (status && ["pending", "confirmed", "cancelled"].includes(status)) {
    conditions.push(eqSafe(status));
  }
  if (q) {
    conditions.push(or(ilike(bookings.code, `%${q}%`), ilike(bookings.name, `%${q}%`), ilike(bookings.phone, `%${q}%`))!);
  }

  const rows = conditions.length
    ? await db.select().from(bookings).where(andSafe(conditions)).orderBy(desc(bookings.createdAt))
    : await db.select().from(bookings).orderBy(desc(bookings.createdAt));

  return NextResponse.json(rows);
}

import { and, eq } from "drizzle-orm";
function eqSafe(status: string) {
  return eq(bookings.status, status);
}
function andSafe(conds: unknown[]) {
  return and(...(conds as Parameters<typeof and>));
}
