import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryImages, offers } from "@/db/schema";
import { getContent } from "@/lib/content";
import { Icon } from "@/components/ui";
import { AboutSection, GallerySection, OffersSection } from "@/components/sections";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();
  const activeOffers = await db.select().from(offers).where(eq(offers.active, true)).orderBy(asc(offers.id));
  const gallery = await db.select().from(galleryImages).orderBy(asc(galleryImages.sort)).limit(8);

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[calc(100vh-72px)] items-center overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content["hero.image"]}
            alt="Signature dish at China Garden, Comilla"
            className="h-full w-full object-cover anim-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-coal/80 via-coal/55 to-coal" />
          <div className="absolute inset-0 bg-gradient-to-r from-coal/85 via-transparent to-coal/40" />
          <div className="pattern-bg absolute inset-0 opacity-25" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-3xl">
            <p className="anim-fade-up flex items-center gap-3 text-xs font-bold uppercase tracking-[0.35em] text-gold2" style={{ animationDelay: "0.1s" }}>
              <span className="h-px w-10 bg-gold" /> {content["hero.eyebrow"] || "Planet SR, Comilla"}
            </p>
            <p className="anim-fade-up mt-5 font-script text-4xl text-ember2 sm:text-5xl" style={{ animationDelay: "0.25s" }}>
              Welcome to {content["brand.logoText"] || "China Garden"}
            </p>
            <h1 className="anim-fade-up mt-3 font-display text-5xl font-semibold leading-[1.05] text-cream sm:text-6xl lg:text-7xl" style={{ animationDelay: "0.4s" }}>
              {content["hero.title"]}
            </h1>
            <p className="anim-fade-up mt-6 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg" style={{ animationDelay: "0.55s" }}>
              {content["hero.subtitle"]}
            </p>
            <div className="anim-fade-up mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "0.7s" }}>
              <Link
                href={content["hero.ctaPrimaryLink"] || "/ceremony"}
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-ember px-7 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-2xl shadow-ember/30 transition hover:bg-ember2"
              >
                {content["hero.ctaPrimaryText"] || "Book Your Ceremony"}
                <Icon name="arrow" className="w-4 h-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href={content["hero.ctaSecondaryLink"] || "/menu"}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gold/50 bg-coal/30 px-7 py-4 text-sm font-bold uppercase tracking-wider text-gold2 backdrop-blur transition hover:bg-gold/10"
              >
                {content["hero.ctaSecondaryText"] || "Explore Our Menu"}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold/70 anim-floaty" aria-hidden>
          <Icon name="chevron" className="w-6 h-6" />
        </div>
      </section>

      {/* INFO STRIP */}
      <section className="border-y border-line bg-ink">
        <div className="mx-auto grid max-w-7xl divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: "pin" as const, t: "Find Us", s: content["contact.address"] },
            { icon: "clock" as const, t: "Open Daily", s: "Lunch & Dinner · Till Late" },
            { icon: "phone" as const, t: "Reservations", s: content["contact.phone"] },
          ].map((i) => (
            <div key={i.t} className="flex items-center gap-4 px-6 py-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                <Icon name={i.icon} className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-widest text-muted">{i.t}</span>
                <span className="block text-sm font-semibold text-cream">{i.s}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <AboutSection content={content} />

      {/* CEREMONY BAND */}
      <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
        <div className="pattern-bg absolute inset-0 opacity-25" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <p className="font-script text-3xl text-ember2">Ceremonies & Events</p>
            <h2 className="mt-1 font-display text-4xl font-semibold text-cream sm:text-5xl">
              Your Celebration, Beautifully Hosted
            </h2>
            <div className="mt-4 h-px w-24 gold-line" />
            <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
              {content["ceremony.intro"]}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Weddings & Receptions", "Birthday Celebrations", "Anniversaries & Engagements", "Corporate Gatherings"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-cream/85">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ember/15 text-ember2">
                    <Icon name="check" className="w-3.5 h-3.5" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/ceremony"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-ember px-7 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-ember/25 transition hover:bg-ember2"
            >
              Book Your Ceremony <Icon name="arrow" className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute -inset-3 rounded-2xl border border-ember/30" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery[0]?.url || content["about.image"]}
              alt="Ceremony setup at China Garden"
              loading="lazy"
              className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
            />
            <div className="brush absolute -bottom-4 left-6 px-4 py-2 text-sm font-bold text-white">
              Weddings · Birthdays · Corporate
            </div>
          </div>
        </div>
      </section>

      <OffersSection offers={activeOffers} />
      <GallerySection images={gallery} />

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-ember/20 via-coal to-coal" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="font-script text-4xl text-gold2">Good Food · Good Mood</p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">
            A Table Awaits You at {content["brand.logoText"] || "China Garden"}
          </h2>
          <p className="mt-4 text-muted">{content["footer.text"]}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/ceremony" className="rounded-lg bg-ember px-7 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-ember/25 hover:bg-ember2">
              Book Your Ceremony
            </Link>
            <Link href="/menu" className="rounded-lg border border-gold/50 px-7 py-4 text-sm font-bold uppercase tracking-wider text-gold2 hover:bg-gold/10">
              Order via WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
