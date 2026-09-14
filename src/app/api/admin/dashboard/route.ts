import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, menuItems, offers } from "@/db/schema";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${bookings.status} = 'pending')::int`,
      confirmed: sql<number>`count(*) filter (where ${bookings.status} = 'confirmed')::int`,
      cancelled: sql<number>`count(*) filter (where ${bookings.status} = 'cancelled')::int`,
    })
    .from(bookings);

  const [menuStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      stockOut: sql<number>`count(*) filter (where ${menuItems.available} = false)::int`,
    })
    .from(menuItems);

  const [offerStats] = await db
    .select({ active: sql<number>`count(*) filter (where ${offers.active} = true)::int` })
    .from(offers);

  const recent = await db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(6);

  return NextResponse.json({
    bookings: stats,
    menu: menuStats,
    offers: offerStats,
    recent,
  });
}
