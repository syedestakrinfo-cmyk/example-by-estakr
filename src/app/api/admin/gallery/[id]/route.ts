import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryImages } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.url === "string" && body.url.trim()) patch.url = body.url.trim();
  if (typeof body.caption === "string") patch.caption = body.caption;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  const [row] = await db.update(galleryImages).set(patch).where(eq(galleryImages.id, Number(id))).returning();
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(galleryImages).where(eq(galleryImages.id, Number(id)));
  return NextResponse.json({ ok: true });
}
