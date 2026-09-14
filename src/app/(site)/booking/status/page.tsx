import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/helpers";
import { Badge, Icon } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking Status – China Garden" };

const STATUS_COPY: Record<string, string> = {
  pending: "Your booking is currently under review. Our events team will confirm availability shortly.",
  confirmed: "Your ceremony booking has been confirmed. We look forward to welcoming you!",
  cancelled: "Unfortunately, this booking request has been cancelled. Please contact us on WhatsApp for assistance.",
};

export default async function BookingStatus({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.code;
  const code = (Array.isArray(raw) ? raw[0] : raw || "").trim().toUpperCase();
  const content = await getContent();
  const wa = content["contact.whatsapp"] || "";

  let booking: typeof bookings.$inferSelect | null = null;
  let searched = false;
  if (code) {
    searched = true;
    const [row] = await db.select().from(bookings).where(eq(bookings.code, code)).limit(1);
    booking = row || null;
  }

  const fmt = (d: string) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    <div className="relative py-16 sm:py-24">
      <div className="pattern-bg absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <p className="font-script text-4xl text-ember2">Track Your Request</p>
          <h1 className="mt-1 font-display text-5xl font-semibold text-cream">Booking Status</h1>
          <div className="mx-auto mt-4 h-px w-24 gold-line" />
          <p className="mt-4 text-muted">Enter the Booking ID you received after submitting your ceremony request.</p>
        </div>

        <form action="/booking/status" method="get" className="mx-auto flex max-w-md gap-2">
          <input
            name="code"
            defaultValue={code}
            placeholder="e.g. CG-CER-7X29K"
            required
            className="w-full rounded-lg border border-line bg-ink px-4 py-3.5 text-sm uppercase tracking-wider text-cream placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/60 outline-none focus:border-gold/60"
          />
          <button type="submit" className="shrink-0 rounded-lg bg-ember px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-ember2">
            Check
          </button>
        </form>

        {searched && !booking && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-center">
            <Icon name="x" className="mx-auto mb-2 w-8 h-8 text-red-400" />
            <p className="font-display text-xl text-cream">No booking found for “{code}”</p>
            <p className="mt-1 text-sm text-muted">Please double-check the ID, or contact us on WhatsApp for help.</p>
          </div>
        )}

        {booking && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-gold/30 bg-ink shadow-2xl anim-fade-up">
            <div className="flex items-center justify-between border-b border-line bg-coal/50 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Booking ID</p>
                <p className="font-display text-2xl font-bold tracking-wider text-gold2">{booking.code}</p>
              </div>
              <Badge status={booking.status} />
            </div>
            <dl className="grid gap-x-6 gap-y-4 px-6 py-6 sm:grid-cols-2">
              {[
                ["Customer", booking.name],
                ["Ceremony", booking.ceremonyType],
                ["Event Date", fmt(booking.eventDate)],
                ["Preferred Time", booking.preferredTime],
                ["Guests", String(booking.guests)],
                ["Phone", booking.phone],
                ["Submitted", new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-cream">{v}</dd>
                </div>
              ))}
            </dl>
            <div
              className={`border-t px-6 py-5 text-sm leading-relaxed ${
                booking.status === "confirmed"
                  ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                  : booking.status === "cancelled"
                  ? "border-red-500/30 bg-red-950/20 text-red-200"
                  : "border-amber-500/30 bg-amber-950/20 text-amber-200"
              }`}
            >
              {STATUS_COPY[booking.status] || STATUS_COPY.pending}
            </div>
            <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row">
              <a
                href={waLink(wa, `Hello China Garden! 👋 I'm checking on my ceremony booking ${booking.code}.`)}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1faa53] px-5 py-3 text-sm font-bold text-white hover:brightness-110"
              >
                <Icon name="whatsapp" className="w-4 h-4" /> Chat on WhatsApp
              </a>
              <Link href="/ceremony" className="flex-1 rounded-lg border border-line px-5 py-3 text-center text-sm font-semibold text-cream hover:border-gold/50">
                New Booking
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
