import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ceremonyTypes } from "@/db/schema";
import { getContent } from "@/lib/content";
import { Icon } from "@/components/ui";
import { CeremonyForm } from "@/components/booking-menu";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Book Your Ceremony – China Garden | Wedding & Event Venue in Comilla",
  description: "Book your wedding, birthday, anniversary or corporate event at China Garden, Planet SR Comilla. Submit a ceremony request and confirm on WhatsApp.",
};

export default async function CeremonyPage() {
  const content = await getContent();
  const types = await db.select().from(ceremonyTypes).where(eq(ceremonyTypes.active, true)).orderBy(asc(ceremonyTypes.sort));
  const wa = content["contact.whatsapp"] || content["social.whatsapp"] || "";

  const steps = [
    { icon: "edit" as const, t: "Submit Your Request", s: "Tell us about your occasion, date and guest count." },
    { icon: "spark" as const, t: "Receive Booking ID", s: "A unique ID like CG-CER-7X29K confirms your request." },
    { icon: "whatsapp" as const, t: "Chat With Our Team", s: "We review, confirm and plan every detail with you." },
  ];

  return (
    <div className="relative py-16 sm:py-20">
      <div className="pattern-bg absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="font-script text-4xl text-ember2">Celebrate With Us</p>
          <h1 className="mt-1 font-display text-5xl font-semibold text-cream sm:text-6xl">Ceremony Booking</h1>
          <div className="mx-auto mt-4 h-px w-24 gold-line" />
          <p className="mx-auto mt-4 max-w-2xl text-muted">{content["ceremony.intro"]}</p>
        </div>

        {types.length > 0 && (
          <div className="mb-12 flex flex-wrap justify-center gap-2.5">
            {types.map((t) => (
              <span key={t.id} className="rounded-full border border-gold/30 bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold2">
                {t.name}
              </span>
            ))}
          </div>
        )}

        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="relative rounded-2xl border border-line bg-ink p-6">
              <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-ember text-xs font-bold text-white">{i + 1}</span>
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ember/15 text-ember2">
                <Icon name={s.icon} className="w-5 h-5" />
              </span>
              <h3 className="font-display text-xl text-cream">{s.t}</h3>
              <p className="mt-1 text-sm text-muted">{s.s}</p>
            </div>
          ))}
        </div>

        <CeremonyForm types={types} whatsapp={wa} />

        <p className="mt-8 text-center text-sm text-muted">
          Already submitted a request?{" "}
          <Link href="/booking/status" className="font-semibold text-gold2 underline-offset-4 hover:underline">
            Check your booking status
          </Link>
        </p>
      </div>
    </div>
  );
}
