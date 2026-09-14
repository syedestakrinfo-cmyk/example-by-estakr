import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.description === "string") patch.description = body.description;
  if (body.price !== undefined) {
    const p = Number(body.price);
    if (!Number.isFinite(p) || p < 0) return NextResponse.json({ error: "Invalid price." }, { status: 400 });
    patch.price = Math.round(p);
  }
  if (typeof body.image === "string") patch.image = body.image;
  if (typeof body.available === "boolean") patch.available = body.available;
  if (typeof body.sort === "number") patch.sort = body.sort;
  if (body.categoryId !== undefined) patch.categoryId = Number(body.categoryId);

  const [row] = await db.update(menuItems).set(patch).where(eq(menuItems.id, Number(id))).returning();
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(menuItems).where(eq(menuItems.id, Number(id)));
  return NextResponse.json({ ok: true });
}
