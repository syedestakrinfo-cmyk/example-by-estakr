import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { menuCategories } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "category";
}

export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(menuCategories).orderBy(asc(menuCategories.sort));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const sort = Number.isFinite(Number(body.sort)) ? Number(body.sort) : 0;
  const active = body.active !== false;

  let slug = slugify(name);
  const dup = await db.select({ id: menuCategories.id }).from(menuCategories).where(eq(menuCategories.slug, slug)).limit(1);
  if (dup.length) slug = `${slug}-${Date.now().toString(36)}`;

  const [row] = await db.insert(menuCategories).values({ name, slug, sort, active }).returning();
  return NextResponse.json(row, { status: 201 });
}
