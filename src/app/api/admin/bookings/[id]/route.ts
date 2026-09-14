import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = String(body.status || "");
  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const [updated] = await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookings.id, Number(id)))
    .returning();
  if (!updated) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(bookings).where(eq(bookings.id, Number(id)));
  return NextResponse.json({ ok: true });
}
