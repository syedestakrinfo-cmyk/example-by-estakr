import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(offers).orderBy(desc(offers.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  const [row] = await db
    .insert(offers)
    .values({
      title,
      description: String(body.description || ""),
      image: String(body.image || ""),
      discount: String(body.discount || ""),
      startDate: String(body.startDate || ""),
      endDate: String(body.endDate || ""),
      active: body.active !== false,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
