"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [searchType, setSearchType] = useState<"code" | "phone">("code");
  const [value, setValue] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkBooking = async (e: FormEvent) => {
    e.preventDefault();

    setBooking(null);
    setError("");

    const searchValue = value.trim();

    if (!searchValue) {
      setError(
        searchType === "code"
          ? "Please enter your booking code."
          : "Please enter your phone number."
      );
      return;
    }

    setLoading(true);

    try {
      let parameter = "";

      if (searchType === "code") {
        parameter =
          "code=" +
          encodeURIComponent(searchValue.toUpperCase());
      } else {
        parameter =
          "phone=" +
          encodeURIComponent(searchValue);
      }

      const response = await fetch(
        "/api/booking-status?" + parameter
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Booking not found.");
        return;
      }

      setBooking(data);
    } catch {
      setError(
        "Unable to check booking status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (active: boolean) => {
    if (active) {
      return "rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-coal";
    }

    return "rounded-lg px-4 py-3 text-sm font-semibold text-cream/60 hover:text-cream";
  };

  const statusClass = () => {
    if (booking?.status === "confirmed") {
      return "rounded-full bg-green-400/10 px-4 py-2 text-sm font-semibold capitalize text-green-300";
    }

    if (booking?.status === "cancelled") {
      return "rounded-full bg-red-400/10 px-4 py-2 text-sm font-semibold capitalize text-red-300";
    }

    return "rounded-full bg-yellow-400/10 px-4 py-2 text-sm font-semibold capitalize text-yellow-300";
  };

  return (
    <main className="min-h-screen bg-coal px-5 py-16 text-cream">
      <div className="mx-auto max-w-2xl">

        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-cream/70 transition hover:border-gold/40 hover:bg-white/10 hover:text-gold"
        >
          <span className="text-lg">←</span>
          Back
        </button>

        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
            China Garden
          </p>

          <h1 className="font-display text-4xl font-semibold">
            Check Your Booking
          </h1>

          <p className="mt-3 text-cream/70">
            Check your booking status using your booking code or phone number.
          </p>
        </div>

        <form
          onSubmit={checkBooking}
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1">

            <button
              type="button"
              onClick={() => {
                setSearchType("code");
                setValue("");
                setError("");
                setBooking(null);
              }}
              className={tabClass(searchType === "code")}
            >
              Booking Code
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchType("phone");
                setValue("");
                setError("");
                setBooking(null);
              }}
              className={tabClass(searchType === "phone")}
            >
              Phone Number
            </button>

          </div>

          <label className="mb-2 block text-sm font-medium">
            {searchType === "code"
              ? "Booking Code"
              : "Phone Number"}
          </label>

          <input
            type={searchType === "phone" ? "tel" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              searchType === "code"
                ? "Example: CG-8F4K29"
                : "Example: 01712345678"
            }
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
                <p className="text-sm text-cream/50">
                  Booking Code
                </p>

                <p className="font-semibold text-gold">
                  {booking.code}
                </p>
              </div>

              <span className={statusClass()}>
                {booking.status}
              </span>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <p className="text-sm text-cream/50">
                  Name
                </p>
                <p className="mt-1">
                  {booking.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-cream/50">
                  Ceremony
                </p>
                <p className="mt-1">
                  {booking.ceremonyType}
                </p>
              </div>

              <div>
                <p className="text-sm text-cream/50">
                  Date
                </p>
                <p className="mt-1">
                  {booking.eventDate}
                </p>
              </div>

              <div>
                <p className="text-sm text-cream/50">
                  Preferred Time
                </p>
                <p className="mt-1">
                  {booking.preferredTime}
                </p>
              </div>

              <div>
                <p className="text-sm text-cream/50">
                  Guests
                </p>
                <p className="mt-1">
                  {booking.guests}
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
