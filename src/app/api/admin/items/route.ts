import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(menuItems).orderBy(asc(menuItems.categoryId), asc(menuItems.sort));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const categoryId = Number(body.categoryId);
  const price = Number(body.price);
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!Number.isFinite(categoryId)) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: "Price must be 0 or more." }, { status: 400 });

  const [row] = await db
    .insert(menuItems)
    .values({
      name,
      categoryId,
      price: Math.round(price),
      description: String(body.description || ""),
      image: String(body.image || ""),
      available: body.available !== false,
      sort: Number.isFinite(Number(body.sort)) ? Number(body.sort) : 0,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
