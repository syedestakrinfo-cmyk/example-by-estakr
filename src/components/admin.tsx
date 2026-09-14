"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { Icon, Img, Spinner, useToast, type IconName } from "@/components/ui";
import { LogoMark } from "@/components/site";

/* ------------------------------ API ------------------------------ */
export async function api<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: opts?.body && !(opts.body instanceof FormData) ? { "Content-Type": "application/json" } : undefined,
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/api/admin/auth")) {
      window.location.href = "/admin/login";
    }
    throw new Error(data.error || data.errors?.name || "Request failed");
  }
  return data as T;
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

/* ----------------------------- Shell ----------------------------- */
const LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/bookings", label: "Ceremony Bookings", icon: "calendar" },
  { href: "/admin/menu", label: "Menu", icon: "bowl" },
  { href: "/admin/offers", label: "Special Offers", icon: "tag" },
  { href: "/admin/gallery", label: "Gallery", icon: "image" },
  { href: "/admin/content", label: "Website Content", icon: "edit" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    await api("/api/admin/auth", { method: "DELETE" }).catch(() => {});
    router.push("/admin/login");
  };

  // Render standalone (no shell) on the login page.
  if (pathname === "/admin/login") return <>{children}</>;

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
        <span className="text-gold"><LogoMark className="w-8 h-8" /></span>
        <div className="leading-tight">
          <p className="font-display text-lg text-cream">China Garden</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Admin Panel</p>
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {LINKS.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                active ? "bg-ember/15 text-ember2 border border-ember/30" : "text-muted hover:bg-ink2 hover:text-cream border border-transparent"
              }`}
            >
              <Icon name={l.icon} className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              {l.label}
            </Link>
          );
        })}
      </div>
      <div className="space-y-1 border-t border-line px-3 py-4">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-muted hover:bg-ink2 hover:text-cream">
          <Icon name="external" className="w-[18px] h-[18px]" /> View Website
        </Link>
        <button
          onClick={logout}
          disabled={busy}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-muted hover:bg-red-500/10 hover:text-red-400"
        >
          {busy ? <Spinner className="w-[18px] h-[18px]" /> : <Icon name="logout" className="w-[18px] h-[18px]" />}
          Sign Out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-coal">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-ink lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-ink anim-fade-in">{nav}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-coal/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="rounded-md border border-line p-2 text-cream lg:hidden" aria-label="Open admin menu">
            <Icon name="menu" className="w-5 h-5" />
          </button>
          <p className="hidden text-sm text-muted lg:block">Manage every part of your website — no developer needed.</p>
          <span className="flex items-center gap-2 text-xs font-semibold text-muted">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Signed in
          </span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

/* --------------------------- Page header -------------------------- */
export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-3xl text-cream">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-ink ${className}`}>{children}</div>;
}

/* --------------------------- Image picker ------------------------- */
export function ImagePicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      const url = await uploadImage(f);
      onChange(url);
      toast("Image uploaded successfully.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-coal">
        {value ? <Img src={value} alt="preview" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-muted"><Icon name="image" className="w-5 h-5" /></div>}
      </div>
      <div className="flex-1 space-y-2">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-cream hover:border-gold/50 disabled:opacity-50"
          >
            {busy ? <Spinner className="w-3.5 h-3.5" /> : <Icon name="upload" className="w-3.5 h-3.5" />}
            Upload Image
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-red-400">
              Remove
            </button>
          )}
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image URL"
          className="w-full rounded-md border border-line bg-coal/60 px-3 py-1.5 text-xs text-cream outline-none focus:border-gold/60"
        />
      </div>
    </div>
  );
}

/* ------------------------- Save button ---------------------------- */
export function SaveButton({ busy, label = "Save Changes" }: { busy: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="flex items-center gap-2 rounded-lg bg-ember px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-ember/20 hover:bg-ember2 disabled:opacity-60"
    >
      {busy && <Spinner className="w-4 h-4" />}
      {label}
    </button>
  );
}
