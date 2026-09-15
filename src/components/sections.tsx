"use client";

import Link from "next/link";
import { useState } from "react";
import type { Content } from "@/lib/helpers";
import { parseHours, parseParagraphs, waLink } from "@/lib/helpers";
import { Icon, Img } from "@/components/ui";

export function SectionHeading({
  script,
  title,
  sub,
  center = true,
}: {
  script: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      <p className="font-script text-3xl text-ember2 sm:text-4xl">{script}</p>
      <h2 className="mt-1 font-display text-4xl font-semibold text-cream sm:text-5xl">
        {title}
      </h2>
      <div className={`mt-4 h-px w-24 gold-line ${center ? "mx-auto" : ""}`} />
      {sub && (
        <p
          className={`mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base ${
            center ? "mx-auto" : ""
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function AboutSection({
  content,
  full,
}: {
  content: Content;
  full?: boolean;
}) {
  const paras = parseParagraphs(content["about.body"] || "");

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pattern-bg absolute inset-0 opacity-30" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl border border-gold/25" />

          <Img
            src={content["about.image"]}
            alt="China Garden dining room"
            className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
          />

          <div className="absolute -bottom-5 -right-3 rounded-xl border border-gold/30 bg-ink/95 px-5 py-3 shadow-xl backdrop-blur sm:-right-5">
            <p className="font-script text-2xl text-gold2">
              Good Food, Good Mood
            </p>
          </div>
        </div>

        <div>
          <p className="font-script text-3xl text-ember2">Our Story</p>

          <h2 className="mt-1 font-display text-4xl font-semibold text-cream sm:text-5xl">
            {content["about.heading"]}
          </h2>

          <div className="mt-4 h-px w-24 gold-line" />

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
            {(full ? paras : paras.slice(0, 2)).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={content["about.ctaLink"] || "/ceremony"}
              className="rounded-md bg-ember px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-ember/25 transition hover:bg-ember2"
            >
              {content["about.ctaText"] || "Plan Your Ceremony"}
            </Link>

            <Link
              href="/menu"
              className="rounded-md border border-gold/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-gold2 transition hover:bg-gold/10"
            >
              View Menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export type Offer = {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  discount: string | null;
  startDate: string | null;
  endDate: string | null;
};

export function OffersSection({ offers }: { offers: Offer[] }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          script="Special Offers"
          title="Something Special Awaits You"
        />

        {offers.length === 0 ? (
          <p className="text-center text-muted">
            No active offers right now — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => (
              <article
                key={o.id}
                className="group relative overflow-hidden rounded-2xl border border-line bg-ink shadow-xl transition hover:border-gold/40"
              >
                <div className="relative h-52 overflow-hidden">
                  <Img
                    src={o.image}
                    alt={o.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent" />

                  {o.discount && (
                    <span className="brush absolute left-4 top-4 px-3 py-1 text-sm font-bold text-white">
                      {o.discount}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-display text-2xl text-cream">
                    {o.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {o.description}
                  </p>

                  {(o.startDate || o.endDate) && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-gold">
                      <Icon name="calendar" className="w-3.5 h-3.5" />
                      {o.startDate || "Now"} → {o.endDate || "Ongoing"}
                    </p>
                  )}

                  <Link
                    href="/ceremony"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ember2 transition hover:text-gold2"
                  >
                    Book Now
                    <Icon name="arrow" className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export type GalleryImage = {
  id: number;
  url: string;
  caption: string | null;
};

export function GallerySection({
  images,
  limit,
}: {
  images: GalleryImage[];
  limit?: number;
}) {
  const [active, setActive] = useState<GalleryImage | null>(null);
  const shown = limit ? images.slice(0, limit) : images;

  return (
    <section className="py-20 sm:py-28 bg-ink/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          script="Gallery"
          title="Moments & Flavours"
          sub="A glimpse inside China Garden — our kitchen, our dining rooms and the celebrations we host."
        />

        {shown.length === 0 ? (
          <p className="text-center text-muted">Gallery coming soon.</p>
        ) : (
          <div className="columns-2 gap-4 md:columns-3 [column-fill:_balance]">
            {shown.map((g, i) => (
              <button
                key={g.id}
                onClick={() => setActive(g)}
                className={`group relative mb-4 block w-full overflow-hidden rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                  i % 5 === 0
                    ? "aspect-[3/4]"
                    : i % 3 === 0
                    ? "aspect-square"
                    : "aspect-[4/3]"
                }`}
              >
                <Img
                  src={g.url}
                  alt={g.caption || "China Garden"}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 transition group-hover:opacity-100" />

                {g.caption && (
                  <p className="absolute bottom-3 left-3 right-3 translate-y-2 text-left text-xs font-semibold text-cream opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                    {g.caption}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4 anim-fade-in"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full border border-white/20 p-2 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <Icon name="x" />
          </button>

          <figure
            className="max-h-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={active.url}
              alt={active.caption || "China Garden"}
              className="max-h-[82vh] w-auto rounded-lg object-contain shadow-2xl"
            />

            {active.caption && (
              <figcaption className="mt-3 text-center text-sm text-muted">
                {active.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}

export function ContactSection({ content }: { content: Content }) {
  const hours = parseHours(content["hours"] || "");
  const wa = content["contact.whatsapp"] || "";

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          script="Find Us"
          title="Visit China Garden"
          sub={content["contact.address"]}
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {[
              {
                icon: "pin" as const,
                label: "Address",
                value: content["contact.address"],
                href: content["contact.mapsUrl"],
              },
              {
                icon: "phone" as const,
                label: "Phone",
                value: content["contact.phone"],
                href: `tel:${(content["contact.phone"] || "").replace(
                  /[^+\d]/g,
                  ""
                )}`,
              },
              {
                icon: "whatsapp" as const,
                label: "WhatsApp",
                value: "Chat with us instantly",
                href: waLink(wa, "Hello China Garden! 👋"),
              },

              // DIRECT CHINA GARDEN FACEBOOK PAGE
              {
                icon: "facebook" as const,
                label: "Facebook",
                value: "Follow our page",
                href: "https://www.facebook.com/profile.php?id=61579918478975",
              },

              {
                icon: "mail" as const,
                label: "Email",
                value: content["contact.email"],
                href: `mailto:${content["contact.email"]}`,
              },
            ]
              .filter((c) => c.value)
              .map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href?.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-line bg-ink p-4 transition hover:border-gold/40"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ember/15 text-ember2">
                    <Icon name={c.icon} className="w-5 h-5" />
                  </span>

                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      {c.label}
                    </span>

                    <span className="block text-sm font-semibold text-cream">
                      {c.value}
                    </span>
                  </span>
                </a>
              ))}
            
            <div className="rounded-xl border border-line bg-ink p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <Icon name="clock" className="w-4 h-4 text-gold" />
                Opening Hours
              </p>

              <ul className="space-y-1.5 text-sm">
                {hours.map((h) => (
                  <li
                    key={h.day}
                    className="flex justify-between text-muted"
                  >
                    <span>{h.day}</span>

                    <span
                      className={
                        h.closed ? "text-red-400" : "text-cream/80"
                      }
                    >
                      {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={waLink(wa, "Hello China Garden! 👋")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#1faa53] px-4 py-3 text-sm font-bold text-white hover:brightness-110"
              >
                <Icon name="whatsapp" className="w-4 h-4" />
                WhatsApp
              </a>

              <a
                href={`tel:${(content["contact.phone"] || "").replace(
                  /[^+\d]/g,
                  ""
                )}`}
                className="flex items-center justify-center gap-2 rounded-lg bg-ember px-4 py-3 text-sm font-bold text-white hover:bg-ember2"
              >
                <Icon name="phone" className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line lg:col-span-3">
            {content["contact.mapsEmbed"] ? (
              <iframe
                src={content["contact.mapsEmbed"]}
                title="China Garden location map"
                className="h-full min-h-[420px] w-full grayscale-[35%] contrast-[1.1]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex h-full min-h-[420px] items-center justify-center bg-ink2 text-muted">
                Map not configured
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}