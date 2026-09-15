console.log("BOOKING STATUS API LOADED");

import { NextResponse } from "next/server";
import { or, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code")?.trim().toUpperCase();
    const phone = searchParams.get("phone")?.trim();

    if (!code && !phone) {
      return NextResponse.json(
        { error: "Booking code or phone number is required." },
        { status: 400 }
      );
    }

    const result = await db
      .select({
        code: bookings.code,
        name: bookings.name,
        ceremonyType: bookings.ceremonyType,
        eventDate: bookings.eventDate,
        preferredTime: bookings.preferredTime,
        guests: bookings.guests,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        code
          ? eq(bookings.code, code)
          : eq(bookings.phone, phone!)
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Booking status error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}