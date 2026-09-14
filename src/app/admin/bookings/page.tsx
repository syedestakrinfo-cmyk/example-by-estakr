"use client";
import { useCallback, useEffect, useState } from "react";
import { Badge, ConfirmDialog, EmptyState, Icon, Modal, Spinner, inputCls } from "@/components/ui";
import { Card, PageHeader, api } from "@/components/admin";
import { waLink } from "@/lib/helpers";

type Booking = {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string | null;
  ceremonyType: string;
  eventDate: string;
  preferredTime: string;
  guests: number;
  message: string | null;
  status: string;
  createdAt: string;
};
type CType = { id: number; name: string; active: boolean; sort: number };

const FILTERS = ["all", "pending", "confirmed", "cancelled"];

export default function BookingsPage() {
  const [tab, setTab] = useState<"bookings" | "types">("bookings");
  const [rows, setRows] = useState<Booking[]>([]);
  const [types, setTypes] = useState<CType[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<Booking | null>(null);
  const [del, setDel] = useState<Booking | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [wa, setWa] = useState("");
  const [newType, setNewType] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status !== "all") params.set("status", status);
      const [b, t, c] = await Promise.all([
        api<Booking[]>(`/api/admin/bookings?${params}`),
        api<CType[]>("/api/admin/ceremony-types"),
        wa ? Promise.resolve({ "contact.whatsapp": wa }) : api<Record<string, string>>("/api/content"),
      ]);
      setRows(b);
      setTypes(t);
      setWa(c["contact.whatsapp"] || "");
    } catch {
      /* toast would go here */
    } finally {
      setLoading(false);
    }
  }, [q, status, wa]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const setStatusOf = async (b: Booking, s: string) => {
    setBusyId(b.id);
    try {
      await api(`/api/admin/bookings/${b.id}`, { method: "PATCH", body: JSON.stringify({ status: s }) });
      await load();
      setView(null);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!del) return;
    setBusyId(del.id);
    await api(`/api/admin/bookings/${del.id}`, { method: "DELETE" }).catch(() => {});
    setDel(null);
    await load();
    setBusyId(null);
  };

  const addType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim()) return;
    await api("/api/admin/ceremony-types", { method: "POST", body: JSON.stringify({ name: newType.trim(), sort: types.length }) });
    setNewType("");
    await load();
  };

  const waMsg = (b: Booking) =>
    waLink(
      wa,
      `Hello ${b.name}! 👋 This is China Garden, Comilla.\n\nRegarding your ceremony booking ${b.code} (${b.ceremonyType} on ${b.eventDate}, ${b.preferredTime}, ${b.guests} guests) — status: ${b.status.toUpperCase()}.\n\nPlease let us know if you have any questions.`
    );

  return (
    <div>
      <PageHeader title="Ceremony Bookings" sub="Review, confirm or cancel ceremony requests. Changes appear instantly on the customer status page." />

      <div className="mb-6 flex gap-2">
        {(["bookings", "types"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === t ? "bg-ember text-white" : "border border-line text-muted hover:text-cream"}`}
          >
            {t === "bookings" ? `Bookings (${rows.length})` : "Ceremony Types"}
          </button>
        ))}
      </div>

      {tab === "bookings" ? (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, name or phone…" className={`${inputCls} pl-9`} />
            </div>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatus(f)}
                  className={`rounded-lg border px-3.5 py-2 text-xs font-bold uppercase tracking-wider ${
                    status === f ? "border-ember bg-ember text-white" : "border-line text-muted hover:text-cream"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-gold"><Spinner className="w-7 h-7" /></div>
          ) : rows.length === 0 ? (
            <EmptyState icon="calendar" title="No bookings found" message="Try a different search or filter." />
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
                    {["Booking ID", "Customer", "Phone", "Ceremony", "Date", "Time", "Guests", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((b) => (
                    <tr key={b.id} className="hover:bg-ink2/50">
                      <td className="px-4 py-3 font-mono text-xs text-gold2">{b.code}</td>
                      <td className="px-4 py-3 text-cream">{b.name}</td>
                      <td className="px-4 py-3 text-muted">{b.phone}</td>
                      <td className="px-4 py-3 text-muted">{b.ceremonyType}</td>
                      <td className="px-4 py-3 text-muted">{b.eventDate}</td>
                      <td className="px-4 py-3 text-muted">{b.preferredTime}</td>
                      <td className="px-4 py-3 text-cream">{b.guests}</td>
                      <td className="px-4 py-3"><Badge status={b.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted">{new Date(b.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setView(b)} title="View details" className="rounded p-1.5 text-muted hover:bg-ink2 hover:text-cream"><Icon name="eye" className="w-4 h-4" /></button>
                          {b.status !== "confirmed" && (
                            <button onClick={() => setStatusOf(b, "confirmed")} title="Confirm" className="rounded p-1.5 text-muted hover:bg-emerald-500/10 hover:text-emerald-400">
                              {busyId === b.id ? <Spinner className="w-4 h-4" /> : <Icon name="check" className="w-4 h-4" />}
                            </button>
                          )}
                          {b.status !== "cancelled" && (
                            <button onClick={() => setStatusOf(b, "cancelled")} title="Cancel" className="rounded p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400"><Icon name="x" className="w-4 h-4" /></button>
                          )}
                          <a href={waMsg(b)} target="_blank" rel="noreferrer" title="Contact on WhatsApp" className="rounded p-1.5 text-muted hover:bg-emerald-500/10 hover:text-emerald-400"><Icon name="whatsapp" className="w-4 h-4" /></a>
                          <button onClick={() => setDel(b)} title="Delete" className="rounded p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400"><Icon name="trash" className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-5">
          <form onSubmit={addType} className="mb-5 flex gap-2">
            <input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="New ceremony type, e.g. Graduation Party" className={inputCls} />
            <button type="submit" className="shrink-0 rounded-lg bg-ember px-5 py-2.5 text-sm font-bold text-white hover:bg-ember2">Add</button>
          </form>
          <ul className="divide-y divide-line">
            {types.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <span className="text-sm font-semibold text-cream">{t.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => { await api(`/api/admin/ceremony-types/${t.id}`, { method: "PATCH", body: JSON.stringify({ active: !t.active }) }); load(); }}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${t.active ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-line text-muted"}`}
                  >
                    {t.active ? "Active" : "Hidden"}
                  </button>
                  <button
                    onClick={async () => { await api(`/api/admin/ceremony-types/${t.id}`, { method: "DELETE" }); load(); }}
                    className="rounded p-1.5 text-muted hover:text-red-400"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={!!view} onClose={() => setView(null)} title={view?.code || ""} wide>
        {view && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Badge status={view.status} />
              <span className="text-xs text-muted">Submitted {new Date(view.createdAt).toLocaleString()}</span>
            </div>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                ["Customer", view.name],
                ["Phone", view.phone],
                ["Email", view.email || "—"],
                ["Ceremony", view.ceremonyType],
                ["Event Date", view.eventDate],
                ["Preferred Time", view.preferredTime],
                ["Guests", String(view.guests)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">{k}</dt>
                  <dd className="text-sm font-semibold text-cream">{v}</dd>
                </div>
              ))}
            </dl>
            {view.message && (
              <div className="mt-4 rounded-lg border border-line bg-coal/50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Special Requirements</p>
                <p className="mt-1 text-sm text-cream/90">{view.message}</p>
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={waMsg(view)} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-[#1faa53] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110">
                <Icon name="whatsapp" className="w-4 h-4" /> WhatsApp
              </a>
              <a href={`tel:${view.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-cream hover:border-gold/50">
                <Icon name="phone" className="w-4 h-4" /> Call
              </a>
              {view.status !== "confirmed" && (
                <button onClick={() => setStatusOf(view, "confirmed")} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500">Confirm</button>
              )}
              {view.status !== "cancelled" && (
                <button onClick={() => setStatusOf(view, "cancelled")} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500">Cancel Booking</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del}
        title="Delete booking?"
        message={`Permanently delete ${del?.code}? This cannot be undone.`}
        confirmText="Delete"
        danger
        busy={busyId === del?.id}
        onConfirm={remove}
        onClose={() => setDel(null)}
      />
    </div>
  );
}
