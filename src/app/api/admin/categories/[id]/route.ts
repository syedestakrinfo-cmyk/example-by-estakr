import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { menuCategories } from "@/db/schema";
import { getAdminId } from "@/lib/auth";
import { slugify } from "../route";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    patch.name = body.name.trim();
    patch.slug = slugify(body.name.trim()) + "-" + id;
  }
  if (typeof body.sort === "number") patch.sort = body.sort;
  if (typeof body.active === "boolean") patch.active = body.active;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  const [row] = await db.update(menuCategories).set(patch).where(eq(menuCategories.id, Number(id))).returning();
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(menuCategories).where(eq(menuCategories.id, Number(id)));
  return NextResponse.json({ ok: true });
}
