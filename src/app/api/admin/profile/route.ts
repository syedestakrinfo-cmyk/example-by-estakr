import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [admin] = await db.select({ id: admins.id, name: admins.name, email: admins.email }).from(admins).where(eq(admins.id, adminId)).limit(1);
  if (!admin) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(admin);
}

export async function PATCH(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.email === "string" && body.email.trim()) {
    if (!/^\S+@\S+\.\S+$/.test(body.email.trim())) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    patch.email = body.email.trim().toLowerCase();
  }
  if (typeof body.currentPassword === "string" || typeof body.newPassword === "string") {
    const [admin] = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
    if (!admin) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!(await bcrypt.compare(String(body.currentPassword || ""), admin.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    const np = String(body.newPassword || "");
    if (np.length < 6) return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    patch.passwordHash = await bcrypt.hash(np, 10);
  }

  const [row] = await db
    .update(admins)
    .set(patch)
    .where(eq(admins.id, adminId))
    .returning({ id: admins.id, name: admins.name, email: admins.email });
  return NextResponse.json(row);
}
