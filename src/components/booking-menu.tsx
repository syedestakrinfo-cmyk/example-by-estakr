"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Img, Spinner, Field, inputCls, useToast } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { taka } from "@/lib/helpers";

/* ------------------------------ MENU ------------------------------ */
export type MenuCategory = { id: number; name: string; slug: string };
export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  available: boolean;
  categoryId: number;
};

export function MenuBrowser({ categories, items }: { categories: MenuCategory[]; items: MenuItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const { add, setOpen } = useCart();
  const toast = useToast();

  const shown = useMemo(() => {
    let list = items;
    if (active !== null) list = list.filter((i) => i.categoryId === active);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q));
    }
    return list;
  }, [items, active, query]);

  const addToCart = (item: MenuItem) => {
    add({ id: item.id, name: item.name, price: item.price, image: item.image });
    toast(`${item.name} added to your order`, "success");
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActive(null)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              active === null ? "border-ember bg-ember text-white" : "border-line text-muted hover:border-gold/50 hover:text-cream"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                active === c.id ? "border-ember bg-ember text-white" : "border-line text-muted hover:border-gold/50 hover:text-cream"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-ink/40 py-16 text-center text-muted">
          No dishes found. Try another category or search term.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-ink shadow-lg transition hover:border-gold/40 hover:shadow-2xl"
            >
              <div className="relative h-44 overflow-hidden">
                <Img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent" />
                {!item.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-[2px]">
                    <span className="rounded-full border border-red-500/40 bg-red-950/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-300">
                      Currently Unavailable
                    </span>
                  </div>
                )}
                <span className="absolute bottom-3 right-3 rounded-md bg-gold/95 px-2.5 py-1 text-sm font-extrabold text-coal shadow">
                  {taka(item.price)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-xl leading-tight text-cream">{item.name}</h3>
                {item.description && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{item.description}</p>}
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.available}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-ember/60 bg-ember/10 px-4 py-2.5 text-sm font-bold text-ember2 transition hover:bg-ember hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:bg-ink2 disabled:text-muted/50"
                  >
                    <Icon name="cart" className="w-4 h-4" />
                    {item.available ? "Add to Cart" : "Unavailable"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {shown.length > 0 && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1faa53] px-6 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110"
          >
            <Icon name="whatsapp" className="w-5 h-5" /> Review Order & Checkout
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------------- CEREMONY FORM ------------------------ */
type CeremonyType = { id: number; name: string };

export function CeremonyForm({ types, whatsapp }: { types: CeremonyType[]; whatsapp: string }) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<"form" | "review">("form");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    ceremonyType: types[0]?.name || "",
    eventDate: "",
    preferredTime: "",
    guests: "",
    message: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const today = new Date().toISOString().slice(0, 10);

  const validate = () => {
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = "Please enter your full name.";
    if (!/^[+\d][\d\s-]{6,18}$/.test(form.phone.trim())) er.phone = "Please enter a valid phone number.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Please enter a valid email.";
    if (!form.ceremonyType) er.ceremonyType = "Please choose a ceremony type.";
    if (!form.eventDate) er.eventDate = "Please choose a date.";
    else if (form.eventDate < today) er.eventDate = "Date cannot be in the past.";
    if (!form.preferredTime) er.preferredTime = "Please choose a time.";
    const g = Number(form.guests);
    if (!form.guests || !Number.isFinite(g) || g < 1) er.guests = "Please enter number of guests.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const review = () => {
    if (validate()) {
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast("Please fix the highlighted fields.", "error");
    }
  };

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, guests: Number(form.guests) }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        toast(data.error || "Unable to submit booking. Please try again.", "error");
        setBusy(false);
        return;
      }
      const params = new URLSearchParams({
        code: data.code,
        name: form.name,
        type: form.ceremonyType,
        date: form.eventDate,
        time: form.preferredTime,
        guests: form.guests,
        phone: form.phone,
        wa: whatsapp,
      });
      router.push(`/booking/success?${params.toString()}`);
    } catch {
      toast("Unable to submit booking. Please try again.", "error");
      setBusy(false);
    }
  };

  if (step === "review") {
    const rows: [string, string][] = [
      ["Full Name", form.name],
      ["Phone", form.phone],
      ["Email", form.email || "—"],
      ["Ceremony", form.ceremonyType],
      ["Event Date", form.eventDate],
      ["Preferred Time", form.preferredTime],
      ["Guests", form.guests],
      ["Special Requirements", form.message || "—"],
    ];
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-gold/30 bg-ink p-6 shadow-2xl sm:p-8">
        <p className="font-script text-3xl text-ember2">Almost there</p>
        <h3 className="mt-1 font-display text-3xl text-cream">Review Your Request</h3>
        <p className="mt-2 text-sm text-muted">Please confirm the details below before submitting.</p>
        <dl className="mt-6 divide-y divide-line rounded-xl border border-line bg-coal/50">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
              <dd className="text-sm font-semibold text-cream sm:text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={() => setStep("form")} className="rounded-lg border border-line px-5 py-3 text-sm font-semibold text-muted hover:text-cream">
            Edit Details
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-ember px-5 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-ember/25 hover:bg-ember2 disabled:opacity-60"
          >
            {busy && <Spinner className="w-4 h-4" />}
            Confirm & Submit Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        review();
      }}
      noValidate
      className="mx-auto max-w-2xl rounded-2xl border border-line bg-ink p-6 shadow-2xl sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Full Name" required>
            <input className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Rahim Uddin" />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </Field>
        </div>
        <Field label="Phone Number" required>
          <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+880 1XXX-XXXXXX" inputMode="tel" />
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
        </Field>
        <Field label="Email (optional)">
          <input className={inputCls} value={form.email} onChange={set("email")} placeholder="you@example.com" inputMode="email" />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </Field>
        <Field label="Ceremony Type" required>
          <select className={inputCls} value={form.ceremonyType} onChange={set("ceremonyType")}>
            {types.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
          {errors.ceremonyType && <p className="mt-1 text-xs text-red-400">{errors.ceremonyType}</p>}
        </Field>
        <Field label="Number of Guests" required>
          <input className={inputCls} value={form.guests} onChange={set("guests")} placeholder="e.g. 120" inputMode="numeric" type="number" min={1} />
          {errors.guests && <p className="mt-1 text-xs text-red-400">{errors.guests}</p>}
        </Field>
        <Field label="Event Date" required>
          <input className={inputCls} type="date" min={today} value={form.eventDate} onChange={set("eventDate")} />
          {errors.eventDate && <p className="mt-1 text-xs text-red-400">{errors.eventDate}</p>}
        </Field>
        <Field label="Preferred Time" required>
          <input className={inputCls} type="time" value={form.preferredTime} onChange={set("preferredTime")} />
          {errors.preferredTime && <p className="mt-1 text-xs text-red-400">{errors.preferredTime}</p>}
        </Field>
        <div className="sm:col-span-2">
          <Field label="Special Requirements / Message">
            <textarea className={`${inputCls} min-h-28`} value={form.message} onChange={set("message")} placeholder="Decoration, menu preferences, stage, parking…" />
          </Field>
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-ember px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-ember/25 transition hover:bg-ember2"
      >
        Review Booking <Icon name="arrow" className="w-4 h-4" />
      </button>
    </form>
  );
}
