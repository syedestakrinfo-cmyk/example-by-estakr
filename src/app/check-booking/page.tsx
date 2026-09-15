"use client";

import { FormEvent, useState } from "react";

type Booking = {
  code: string;
  name: string;
  ceremonyType: string;
  eventDate: string;
  preferredTime: string;
  guests: number;
  status: string;
};

export default function CheckBookingPage() {
  const [code, setCode] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkBooking = async (e: FormEvent) => {
    e.preventDefault();

    setBooking(null);
    setError("");

    const bookingCode = code.trim().toUpperCase();

    if (!bookingCode) {
      setError("Please enter your booking code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/booking-status?code=${encodeURIComponent(bookingCode)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Booking not found.");
        return;
      }

      setBooking(data);
    } catch {
      setError("Unable to check booking status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-coal px-5 py-16 text-cream">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
            China Garden
          </p>

          <h1 className="font-display text-4xl font-semibold">
            Check Your Booking
          </h1>

          <p className="mt-3 text-cream/70">
            Enter your booking code to see the latest status of your booking.
          </p>
        </div>

        <form
          onSubmit={checkBooking}
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <label className="mb-2 block text-sm font-medium">
            Booking Code
          </label>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Example: CG-8F4K29"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-cream outline-none placeholder:text-cream/30 focus:border-gold"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-gold px-5 py-3 font-semibold text-coal transition hover:bg-gold2 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check Status"}
          </button>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
              {error}
            </p>
          )}
        </form>

        {booking && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-cream/50">Booking Code</p>
                <p className="font-semibold text-gold">{booking.code}</p>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                  booking.status === "confirmed"
                    ? "bg-green-400/10 text-green-300"
                    : booking.status === "cancelled"
                      ? "bg-red-400/10 text-red-300"
                      : "bg-yellow-400/10 text-yellow-300"
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-cream/50">Name</p>
                <p className="mt-1">{booking.name}</p>
              </div>

              <div>
                <p className="text-sm text-cream/50">Ceremony</p>
                <p className="mt-1">{booking.ceremonyType}</p>
              </div>

              <div>
                <p className="text-sm text-cream/50">Date</p>
                <p className="mt-1">{booking.eventDate}</p>
              </div>

              <div>
                <p className="text-sm text-cream/50">Preferred Time</p>
                <p className="mt-1">{booking.preferredTime}</p>
              </div>

              <div>
                <p className="text-sm text-cream/50">Guests</p>
                <p className="mt-1">{booking.guests}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}