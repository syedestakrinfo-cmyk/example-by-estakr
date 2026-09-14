"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/helpers";
import { parseHours, waLink } from "@/lib/helpers";
import { useCart } from "@/lib/cart";
import { Icon } from "@/components/ui";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/ceremony", label: "Ceremony Booking" },
  { href: "/menu", label: "Menu" },
  { href: "/offers", label: "Offers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function LogoMark({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 26h32a16 16 0 0 1-32 0z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M14 26c0 6 4 10 10 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M18 18c0-3 2-3 2-6M26 18c0-3 2-3 2-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M30 6l8 14M34 5l6 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

export function Logo({
  content,
  light,
}: {
  content: Content;
  light?: boolean;
}) {
  const logoImage = content["brand.logoImage"];

  return (
    <Link href="/" className="group flex items-center gap-2.5">
      {logoImage ? (
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden">
          <Image
            src={logoImage}
            alt={content["brand.logoText"] || "China Garden"}
            fill
            sizes="44px"
            className="object-contain transition group-hover:scale-105"
          />
        </span>
      ) : (
        <span className="text-gold transition group-hover:text-gold2">
          <LogoMark />
        </span>
      )}

      <span className="leading-none">
        <span
          className={`block font-display text-2xl font-semibold tracking-wide ${
            light ? "text-coal" : "text-cream"
          }`}
        >
          {content["brand.logoText"] || "China Garden"}
        </span>

        <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
          {content["brand.tagline"] || "Planet SR, Comilla"}
        </span>
      </span>
    </Link>
  );
}

export function Navbar({ content }: { content: Content }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen: setCart } = useCart();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);

    h();

    window.addEventListener("scroll", h, { passive: true });

    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[70] transition-all duration-300 ${
        scrolled || open
          ? "border-b border-line bg-coal/90 backdrop-blur-xl"
          : "bg-gradient-to-b from-black/70 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo content={content} />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-md px-3 py-2 text-[13px] font-semibold tracking-wide transition ${
                pathname === n.href
                  ? "text-gold2"
                  : "text-cream/80 hover:text-cream"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCart(true)}
            className="relative rounded-md border border-line bg-ink/60 p-2.5 text-cream hover:border-gold/50 hover:text-gold2"
            aria-label="Open cart"
          >
            <Icon name="cart" className="w-5 h-5" />

            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          <Link
            href="/ceremony"
            className="hidden rounded-md bg-ember px-4 py-2.5 text-[13px] font-bold uppercase tracking-wider text-white shadow-lg shadow-ember/25 transition hover:bg-ember2 sm:block"
          >
            Book Your Ceremony
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-line bg-ink/60 p-2.5 text-cream lg:hidden"
            aria-label="Toggle menu"
          >
            <Icon name={open ? "x" : "menu"} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-coal/95 backdrop-blur-xl lg:hidden anim-fade-in">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`block rounded-lg px-4 py-3 text-sm font-semibold ${
                  pathname === n.href
                    ? "bg-ink2 text-gold2"
                    : "text-cream/85 hover:bg-ink2"
                }`}
              >
                {n.label}
              </Link>
            ))}

            <Link
              href="/ceremony"
              className="mt-2 block rounded-lg bg-ember px-4 py-3 text-center text-sm font-bold uppercase tracking-wider text-white"
            >
              Book Your Ceremony
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer({ content }: { content: Content }) {
  const hours = parseHours(content["hours"] || "");

  return (
    <footer className="relative border-t border-line bg-ink">
      <div className="pattern-bg absolute inset-0 opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo content={content} />

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {content["footer.text"]}
            </p>

            <div className="mt-5 flex gap-2">
              {content["social.facebook"] && (
                <a
                  href={content["social.facebook"]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="rounded-md border border-line p-2.5 text-muted hover:border-gold/50 hover:text-gold2"
                >
                  <Icon name="facebook" className="w-4 h-4" />
                </a>
              )}

              {content["social.instagram"] && (
                <a
                  href={content["social.instagram"]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="rounded-md border border-line p-2.5 text-muted hover:border-gold/50 hover:text-gold2"
                >
                  <Icon name="instagram" className="w-4 h-4" />
                </a>
              )}

              <a
                href={waLink(
                  content["social.whatsapp"] ||
                    content["contact.whatsapp"] ||
                    "",
                  "Hello China Garden! 👋"
                )}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="rounded-md border border-line p-2.5 text-muted hover:border-gold/50 hover:text-gold2"
              >
                <Icon name="whatsapp" className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg text-gold2">
              Quick Links
            </h4>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-muted transition hover:text-cream"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg text-gold2">
              Contact
            </h4>

            <ul className="space-y-3 text-sm text-muted">
              <li className="flex gap-2.5">
                <Icon
                  name="pin"
                  className="mt-0.5 w-4 h-4 shrink-0 text-gold"
                />
                {content["contact.address"]}
              </li>

              <li className="flex gap-2.5 items-center">
                <Icon
                  name="phone"
                  className="w-4 h-4 shrink-0 text-gold"
                />

                <a
                  href={`tel:${(content["contact.phone"] || "").replace(
                    /[^+\d]/g,
                    ""
                  )}`}
                  className="hover:text-cream"
                >
                  {content["contact.phone"]}
                </a>
              </li>

              <li className="flex gap-2.5 items-center">
                <Icon
                  name="whatsapp"
                  className="w-4 h-4 shrink-0 text-gold"
                />

                <a
                  href={waLink(
                    content["contact.whatsapp"] || "",
                    "Hello China Garden! 👋"
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cream"
                >
                  Chat on WhatsApp
                </a>
              </li>

              <li className="flex gap-2.5 items-center">
                <Icon
                  name="external"
                  className="w-4 h-4 shrink-0 text-gold"
                />

                <a
                  href={content["contact.mapsUrl"]}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cream"
                >
                  Google Maps
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg text-gold2">
              Opening Hours
            </h4>

            <ul className="space-y-2 text-sm">
              {hours.map((h) => (
                <li
                  key={h.day}
                  className="flex justify-between gap-4 text-muted"
                >
                  <span>{h.day}</span>

                  <span
                    className={
                      h.closed ? "text-red-400" : "text-cream/80"
                    }
                  >
                    {h.closed
                      ? "Closed"
                      : `${h.open} – ${h.close}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <p>{content["footer.copyright"]}</p>

          <p className="flex items-center gap-1.5">
            <Icon name="bowl" className="w-4 h-4 text-gold" />
            Good Food · Good Mood
          </p>
        </div>
      </div>
    </footer>
  );
}

export function FloatingWhatsApp({ content }: { content: Content }) {
  const num =
    content["social.whatsapp"] ||
    content["contact.whatsapp"] ||
    "";

  if (!num) return null;

  return (
    <a
      href={waLink(
        num,
        "Hello China Garden! 👋 I'd like to know more about your restaurant."
      )}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#1faa53] text-white shadow-2xl shadow-emerald-950/50 transition hover:scale-105 anim-floaty"
    >
      <Icon name="whatsapp" className="w-7 h-7" />
    </a>
  );
}