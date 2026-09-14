import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";

export const dynamic = "force-dynamic";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

async function uniqueCode(): Promise<string> {
  for (;;) {
    let code = "CG-CER-";
    for (let i = 0; i < 5; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const existing = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.code, code)).limit(1);
    if (existing.length === 0) return code;
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const ceremonyType = String(body.ceremonyType || "").trim();
  const eventDate = String(body.eventDate || "").trim();
  const preferredTime = String(body.preferredTime || "").trim();
  const guests = Number(body.guests);
  const message = String(body.message || "").trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your full name.";
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Please enter a valid email address.";
  if (!ceremonyType) errors.ceremonyType = "Please select a ceremony type.";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(eventDate + "T00:00:00");
  if (!eventDate || isNaN(d.getTime())) errors.eventDate = "Please choose a date.";
  else if (d < today) errors.eventDate = "The event date cannot be in the past.";
  if (!preferredTime) errors.preferredTime = "Please choose a preferred time.";
  if (!Number.isFinite(guests) || guests < 1 || guests > 5000) errors.guests = "Guests must be between 1 and 5000.";

  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const code = await uniqueCode();
  await db.insert(bookings).values({
    code,
    name,
    phone,
    email,
    ceremonyType,
    eventDate,
    preferredTime,
    guests: Math.round(guests),
    message,
    status: "pending",
  });

  return NextResponse.json({ code, status: "pending" }, { status: 201 });
}
