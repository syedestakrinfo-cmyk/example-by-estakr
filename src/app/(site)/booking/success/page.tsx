import Link from "next/link";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/helpers";
import { Icon } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking Received – China Garden" };

export default async function BookingSuccess({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v || "";
  };
  const code = get("code");
  const content = await getContent();
  const wa = get("wa") || content["contact.whatsapp"] || "";

  const name = get("name");
  const type = get("type");
  const date = get("date");
  const time = get("time");
  const guests = get("guests");

  const prettyDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const message =
    `Hello China Garden! 👋\n\n` +
    `I have submitted a ceremony booking request.\n\n` +
    `Booking ID: ${code}\n` +
    `Name: ${name}\n` +
    `Ceremony: ${type}\n` +
    `Date: ${prettyDate || date}\n` +
    `Time: ${time}\n` +
    `Guests: ${guests}\n\n` +
    `I would like to discuss my booking with your team.\n\nThank you!`;

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] items-center py-16">
      <div className="pattern-bg absolute inset-0 opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent" />
      <div className="relative mx-auto w-full max-w-2xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-gold/30 bg-ink shadow-2xl">
          <div className="border-b border-line bg-gradient-to-r from-ember/20 via-gold/10 to-ember/20 px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 anim-fade-up">
              <Icon name="check" className="w-8 h-8" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-cream sm:text-4xl anim-fade-up" style={{ animationDelay: "0.1s" }}>
              Thank You So Much for Choosing China Garden!
            </h1>
            <p className="mt-2 text-sm text-muted anim-fade-up" style={{ animationDelay: "0.2s" }}>
              Your ceremony booking request has been received successfully.
            </p>
          </div>
          <div className="px-6 py-8 sm:px-10">
            <div className="rounded-2xl border border-dashed border-gold/40 bg-coal/60 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted">Booking ID</p>
              <p className="mt-2 font-display text-4xl font-bold tracking-wider text-gold2">{code || "—"}</p>
              <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Status: Pending Confirmation</span>
              </div>
            </div>
            <p className="mt-6 text-center text-sm leading-relaxed text-muted">
              Our team will review your request and get in touch with you shortly. Keep your Booking ID safe — you can use it to check your status at any time.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <a
                href={waLink(wa, message)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-xl bg-[#1faa53] px-6 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-950/40 transition hover:brightness-110"
              >
                <Icon name="whatsapp" className="w-5 h-5" /> Chat on WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/booking/status" className="rounded-xl border border-line px-5 py-3.5 text-center text-sm font-semibold text-cream hover:border-gold/50">
                  Check Status
                </Link>
                <Link href="/" className="rounded-xl border border-line px-5 py-3.5 text-center text-sm font-semibold text-cream hover:border-gold/50">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
