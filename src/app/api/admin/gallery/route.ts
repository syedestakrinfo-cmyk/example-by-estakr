import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { galleryImages } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(galleryImages).orderBy(asc(galleryImages.sort));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const url = String(body.url || "").trim();
  if (!url) return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
  const [max] = await db.select({ m: sql<number>`coalesce(max(${galleryImages.sort}), -1)::int` }).from(galleryImages);
  const [row] = await db
    .insert(galleryImages)
    .values({ url, caption: String(body.caption || ""), sort: (max?.m ?? -1) + 1 })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

/** Reorder: body { order: number[] } */
export async function PATCH(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const order: number[] = Array.isArray(body.order) ? body.order.map(Number) : [];
  if (!order.length) return NextResponse.json({ error: "Order array required." }, { status: 400 });
  await db.transaction(async (tx) => {
    for (let i = 0; i < order.length; i++) {
      await tx.update(galleryImages).set({ sort: i }).where(eq(galleryImages.id, order[i]));
    }
  });
  return NextResponse.json({ ok: true });
}
