import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteContent } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(siteContent);
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json(map);
}

/** Body: { key: value, ... } — upserts each provided CMS key. */
export async function PUT(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  const entries = Object.entries(body as Record<string, unknown>).filter(
    ([k, v]) => typeof k === "string" && typeof v === "string"
  );
  if (!entries.length) return NextResponse.json({ error: "No valid fields." }, { status: 400 });

  await db.transaction(async (tx) => {
    for (const [key, value] of entries) {
      const existing = await tx.select({ key: siteContent.key }).from(siteContent).where(eq(siteContent.key, key)).limit(1);
      if (existing.length) {
        await tx.update(siteContent).set({ value: value as string, updatedAt: new Date() }).where(eq(siteContent.key, key));
      } else {
        await tx.insert(siteContent).values({ key, value: value as string });
      }
    }
  });
  return NextResponse.json({ ok: true, updated: entries.length });
}
