"use client";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog, EmptyState, Field, Icon, Img, Modal, Spinner, inputCls, useToast } from "@/components/ui";
import { Card, ImagePicker, PageHeader, SaveButton, api } from "@/components/admin";

type Offer = {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  discount: string | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
};

const empty = { title: "", description: "", image: "", discount: "", startDate: "", endDate: "", active: true };

export default function OffersPage() {
  const toast = useToast();
  const [rows, setRows] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [del, setDel] = useState<Offer | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await api<Offer[]>("/api/admin/offers"));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      if (editId) await api(`/api/admin/offers/${editId}`, { method: "PATCH", body: JSON.stringify(editing) });
      else await api("/api/admin/offers", { method: "POST", body: JSON.stringify(editing) });
      toast(editId ? "Offer updated successfully." : "Offer created successfully.");
      setEditing(null); setEditId(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (o: Offer) => {
    await api(`/api/admin/offers/${o.id}`, { method: "PATCH", body: JSON.stringify({ active: !o.active }) });
    toast(o.active ? "Offer deactivated." : "Offer activated.", "info");
    await load();
  };

  const remove = async () => {
    if (!del) return;
    setBusy(true);
    await api(`/api/admin/offers/${del.id}`, { method: "DELETE" });
    toast("Offer deleted successfully.");
    setDel(null); await load(); setBusy(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gold"><Spinner className="w-8 h-8" /></div>;

  return (
    <div>
      <PageHeader
        title="Special Offers"
        sub="Only active offers appear on the customer website."
        action={
          <button onClick={() => { setEditId(null); setEditing({ ...empty }); }} className="rounded-lg bg-ember px-4 py-2.5 text-sm font-bold text-white hover:bg-ember2">
            + Create Offer
          </button>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon="tag" title="No offers yet" message="Create your first special offer." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((o) => (
            <Card key={o.id} className="overflow-hidden">
              <div className="relative h-40">
                <Img src={o.image} alt={o.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink" />
                {o.discount && <span className="brush absolute left-3 top-3 px-2.5 py-1 text-xs font-bold text-white">{o.discount}</span>}
                <button
                  onClick={() => toggle(o)}
                  className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur ${
                    o.active ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200" : "border-white/20 bg-black/40 text-muted"
                  }`}
                >
                  {o.active ? "Active" : "Inactive"}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl text-cream">{o.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{o.description}</p>
                {(o.startDate || o.endDate) && (
                  <p className="mt-2 text-[11px] text-gold">{o.startDate || "Now"} → {o.endDate || "Ongoing"}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => { setEditId(o.id); setEditing({ title: o.title, description: o.description || "", image: o.image || "", discount: o.discount || "", startDate: o.startDate || "", endDate: o.endDate || "", active: o.active }); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-xs font-bold text-cream hover:border-gold/50">
                    <Icon name="edit" className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDel(o)} className="flex items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-bold text-muted hover:border-red-500/50 hover:text-red-400">
                    <Icon name="trash" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => { setEditing(null); setEditId(null); }} title={editId ? "Edit Offer" : "Create Offer"} wide>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" required>
                <input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
              </Field>
              <Field label="Discount Text">
                <input className={inputCls} value={editing.discount} onChange={(e) => setEditing({ ...editing, discount: e.target.value })} placeholder="e.g. 20% OFF" />
              </Field>
            </div>
            <Field label="Description">
              <textarea className={`${inputCls} min-h-20`} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <Field label="Image">
              <ImagePicker value={editing.image} onChange={(url) => setEditing({ ...editing, image: url })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start Date">
                <input className={inputCls} type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
              </Field>
              <Field label="End Date">
                <input className={inputCls} type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-cream">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-4 w-4 accent-[#d8432a]" />
              Active (visible on website)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setEditing(null); setEditId(null); }} className="rounded-lg border border-line px-4 py-2.5 text-sm text-muted hover:text-cream">Cancel</button>
              <SaveButton busy={busy} label={editId ? "Update Offer" : "Create Offer"} />
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!del} title="Delete offer?" message={`Delete “${del?.title}”?`} confirmText="Delete" danger busy={busy} onConfirm={remove} onClose={() => setDel(null)} />
    </div>
  );
}
