"use client";

import { useEffect, useMemo, useState } from "react";
import { waLink } from "@/lib/helpers";

type Booking = {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  ceremonyType: string;
  eventDate: string;
  preferredTime: string;
  guests: number;
  message: string;
  status: string;
  createdAt: string;
};

type CType = {
  id: number;
  name: string;
  active: boolean;
  sort: number;
};

async function api(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Something went wrong");
  }

  return data;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [types, setTypes] = useState<CType[]>([]);
  const [wa, setWa] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [ceremony, setCeremony] = useState("all");

  const [view, setView] = useState<Booking | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status !== "all") {
        params.set("status", status);
      }

      if (ceremony !== "all") {
        params.set("ceremonyType", ceremony);
      }

      const bookingUrl =
        "/api/admin/bookings?" + params.toString();

      const bookingData = (await api(bookingUrl)) as Booking[];

      const typeData = (await api(
        "/api/admin/ceremony-types"
      )) as CType[];

      let contentData: Record<string, string> = {};

      if (wa) {
        contentData = {
          "contact.whatsapp": wa,
        };
      } else {
        contentData = (await api(
          "/api/content"
        )) as Record<string, string>;
      }

      setBookings(bookingData);
      setTypes(typeData);
      setWa(contentData["contact.whatsapp"] || "");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status, ceremony]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return bookings;

    return bookings.filter((b) => {
      return (
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q)
      );
    });
  }, [bookings, search]);

  const updateStatus = async (
    booking: Booking,
    newStatus: string
  ) => {
    try {
      await api("/api/admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({
          id: booking.id,
          status: newStatus,
        }),
      });

      await load();

      setView((current) =>
        current
          ? {
              ...current,
              status: newStatus,
            }
          : null
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    }
  };

  const cancelBooking = async (booking: Booking) => {
    const confirmed = window.confirm(
      `Cancel booking ${booking.code}?`
    );

    if (!confirmed) return;

    await updateStatus(booking, "cancelled");
  };

  const waMsg = (booking: Booking) =>
    waLink(
      booking.phone,
      `Hello ${booking.name}! 👋 This is China Garden, Comilla.

Regarding your ceremony booking ${booking.code} (${booking.ceremonyType} on ${booking.eventDate}, ${booking.preferredTime}, ${booking.guests} guests) — status: ${booking.status.toUpperCase()}.

Please let us know if you have any questions.`
    );

  return (
    <div className="min-h-screen bg-coal text-cream">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Ceremony Bookings
            </h1>

            <p className="mt-2 text-sm text-cream/60">
              Manage and review customer ceremony bookings.
            </p>
          </div>

          <button
            onClick={load}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_180px_180px_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, code, phone..."
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-cream/30 focus:border-gold"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-gold"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={ceremony}
            onChange={(e) => setCeremony(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-gold"
          >
            <option value="all">All Ceremonies</option>

            {types.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>

          <button
            onClick={load}
            className="rounded-xl bg-gold px-5 py-3 text-sm font-bold text-coal transition hover:bg-gold2"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-cream/60">
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-cream/60">
            No bookings found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-white/10 bg-black/20">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Booking
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Ceremony
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Date
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Guests
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gold">
                          {booking.code}
                        </div>

                        <div className="mt-1 text-xs text-cream/40">
                          {booking.preferredTime}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {booking.name}
                        </div>

                        <div className="mt-1 text-xs text-cream/50">
                          {booking.phone}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {booking.ceremonyType}
                      </td>

                      <td className="px-5 py-4">
                        {booking.eventDate}
                      </td>

                      <td className="px-5 py-4">
                        {booking.guests}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            booking.status === "confirmed"
                              ? "bg-green-400/10 text-green-300"
                              : booking.status === "cancelled"
                                ? "bg-red-400/10 text-red-300"
                                : "bg-yellow-400/10 text-yellow-300"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setView(booking)}
                          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-coal p-6 shadow-2xl">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-cream/50">
                    Booking Code
                  </p>

                  <h2 className="mt-1 font-display text-2xl font-semibold text-gold">
                    {view.code}
                  </h2>
                </div>

                <button
                  onClick={() => setView(null)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/40">
                    Name
                  </p>
                  <p className="mt-1 font-medium">
                    {view.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/40">
                    Phone
                  </p>
                  <p className="mt-1 font-medium">
                    {view.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/40">
                    Email
                  </p>
                  <p className="mt-1 font-medium">
                    {view.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/40">
                    Ceremony
                  </p>
                  <p className="mt-1 font-medium">
                    {view.ceremonyType}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/40">
                    Date
                  </p>
                  <p className="mt-1 font-medium">
                    {view.eventDate}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/40">
                    Preferred Time
                  </p>
                  <p className="mt-1 font-medium">
                    {view.preferredTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/40">
                    Guests
                  </p>
                  <p className="mt-1 font-medium">
                    {view.guests}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/40">
                    Status
                  </p>

                  <p className="mt-1 font-semibold capitalize">
                    {view.status}
                  </p>
                </div>
              </div>

              {view.message && (
                <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-cream/40">
                    Customer Message
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-cream/80">
                    {view.message}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <a
                  href={waMsg(view)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-[#1faa53] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
                >
                  WhatsApp
                </a>

                <a
                  href={"tel:" + view.phone}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
                >
                  Call
                </a>

                {view.status !== "cancelled" && (
                  <button
                    onClick={() => cancelBooking(view)}
                    className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
                  >
                    Cancel Booking
                  </button>
                )}

                {view.status === "pending" && (
                  <button
                    onClick={() =>
                      updateStatus(view, "confirmed")
                    }
                    className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
                  >
                    Confirm Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}