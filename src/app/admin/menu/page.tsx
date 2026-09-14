"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog, EmptyState, Field, Icon, Img, Modal, Spinner, inputCls, useToast } from "@/components/ui";
import { Card, ImagePicker, PageHeader, SaveButton, api } from "@/components/admin";

type Cat = { id: number; name: string; slug: string; active: boolean; sort: number };
type Item = {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  available: boolean;
  sort: number;
};

const emptyItem = { name: "", categoryId: 0, price: "", description: "", image: "", available: true, sort: 0 };

export default function MenuPage() {
  const toast = useToast();
  const [cats, setCats] = useState<Cat[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<number | 0>(0);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<typeof emptyItem | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [del, setDel] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [newCat, setNewCat] = useState("");

  const load = useCallback(async () => {
    try {
      const [c, i] = await Promise.all([api<Cat[]>("/api/admin/categories"), api<Item[]>("/api/admin/items")]);
      setCats(c);
      setItems(i);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const catName = (id: number) => cats.find((c) => c.id === id)?.name || "—";

  const shown = useMemo(() => {
    let list = items;
    if (catFilter) list = list.filter((i) => i.categoryId === catFilter);
    if (q.trim()) list = list.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
    return [...list].sort((a, b) => a.categoryId - b.categoryId || a.sort - b.sort);
  }, [items, catFilter, q]);

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      const payload = { ...editing, price: Number(editing.price), categoryId: Number(editing.categoryId) };
      if (editId) await api(`/api/admin/items/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await api("/api/admin/items", { method: "POST", body: JSON.stringify(payload) });
      toast(editId ? "Menu item updated successfully." : "Menu item added successfully.");
      setEditing(null);
      setEditId(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const toggleAvail = async (i: Item) => {
    await api(`/api/admin/items/${i.id}`, { method: "PATCH", body: JSON.stringify({ available: !i.available }) });
    toast(i.available ? `${i.name} marked as Stock Out.` : `${i.name} is Available again.`, "info");
    await load();
  };

  const move = async (item: Item, dir: -1 | 1) => {
    const siblings = items.filter((i) => i.categoryId === item.categoryId).sort((a, b) => a.sort - b.sort);
    const idx = siblings.findIndex((s) => s.id === item.id);
    const other = siblings[idx + dir];
    if (!other) return;
    await Promise.all([
      api(`/api/admin/items/${item.id}`, { method: "PATCH", body: JSON.stringify({ sort: other.sort }) }),
      api(`/api/admin/items/${other.id}`, { method: "PATCH", body: JSON.stringify({ sort: item.sort }) }),
    ]);
    await load();
  };

  const removeItem = async () => {
    if (!del) return;
    setBusy(true);
    await api(`/api/admin/items/${del.id}`, { method: "DELETE" });
    toast("Menu item deleted successfully.");
    setDel(null);
    await load();
    setBusy(false);
  };

  const addCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    await api("/api/admin/categories", { method: "POST", body: JSON.stringify({ name: newCat.trim(), sort: cats.length }) });
    setNewCat("");
    toast("Category added.");
    await load();
  };

  const moveCat = async (cat: Cat, dir: -1 | 1) => {
    const sorted = [...cats].sort((a, b) => a.sort - b.sort);
    const idx = sorted.findIndex((c) => c.id === cat.id);
    const other = sorted[idx + dir];
    if (!other) return;
    await Promise.all([
      api(`/api/admin/categories/${cat.id}`, { method: "PATCH", body: JSON.stringify({ sort: other.sort }) }),
      api(`/api/admin/categories/${other.id}`, { method: "PATCH", body: JSON.stringify({ sort: cat.sort }) }),
    ]);
    await load();
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gold"><Spinner className="w-8 h-8" /></div>;

  return (
    <div>
      <PageHeader
        title="Menu Management"
        sub="Manage categories and every dish. Stock-out items are instantly disabled on the website."
        action={
          <button onClick={() => { setEditId(null); setEditing({ ...emptyItem, categoryId: catFilter || cats[0]?.id || 0 }); }} className="rounded-lg bg-ember px-4 py-2.5 text-sm font-bold text-white hover:bg-ember2">
            + Add Menu Item
          </button>
        }
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-xl text-cream">Categories</h2>
          <form onSubmit={addCat} className="mb-4 flex gap-2">
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name" className={inputCls} />
            <button className="shrink-0 rounded-lg bg-ember px-4 text-sm font-bold text-white hover:bg-ember2">Add</button>
          </form>
          <ul className="max-h-96 space-y-1.5 overflow-y-auto pr-1">
            {[...cats].sort((a, b) => a.sort - b.sort).map((c) => (
              <li key={c.id} className="flex items-center gap-1.5 rounded-lg border border-line bg-coal/40 px-3 py-2">
                <span className={`flex-1 truncate text-sm font-semibold ${c.active ? "text-cream" : "text-muted line-through"}`}>{c.name}</span>
                <button onClick={() => moveCat(c, -1)} className="rounded p-1 text-muted hover:text-cream" aria-label="Move up"><Icon name="up" className="w-3.5 h-3.5" /></button>
                <button onClick={() => moveCat(c, 1)} className="rounded p-1 text-muted hover:text-cream" aria-label="Move down"><Icon name="down" className="w-3.5 h-3.5" /></button>
                <button
                  onClick={async () => { await api(`/api/admin/categories/${c.id}`, { method: "PATCH", body: JSON.stringify({ active: !c.active }) }); load(); }}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${c.active ? "border-emerald-500/40 text-emerald-300" : "border-line text-muted"}`}
                >
                  {c.active ? "On" : "Off"}
                </button>
                <button onClick={async () => { await api(`/api/admin/categories/${c.id}`, { method: "DELETE" }); load(); }} className="rounded p-1 text-muted hover:text-red-400" aria-label="Delete category">
                  <Icon name="trash" className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items…" className={`${inputCls} pl-9`} />
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(Number(e.target.value))} className={`${inputCls} sm:w-56`}>
              <option value={0}>All categories</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {shown.length === 0 ? (
            <EmptyState icon="bowl" title="No items" message="Add your first dish with the button above." />
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
                    {["Item", "Category", "Price", "Order", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((i) => (
                    <tr key={i.id} className="hover:bg-ink2/50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <Img src={i.image} alt={i.name} className="h-10 w-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-semibold text-cream">{i.name}</p>
                            {i.description && <p className="max-w-[220px] truncate text-xs text-muted">{i.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted">{catName(i.categoryId)}</td>
                      <td className="px-4 py-2.5 font-semibold text-gold2">৳{i.price.toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={() => move(i, -1)} className="rounded p-1 text-muted hover:text-cream" aria-label="Move up"><Icon name="up" className="w-3.5 h-3.5" /></button>
                          <button onClick={() => move(i, 1)} className="rounded p-1 text-muted hover:text-cream" aria-label="Move down"><Icon name="down" className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => toggleAvail(i)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            i.available ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"
                          }`}
                        >
                          {i.available ? "Available" : "Stock Out"}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditId(i.id); setEditing({ name: i.name, categoryId: i.categoryId, price: String(i.price), description: i.description || "", image: i.image || "", available: i.available, sort: i.sort }); }} className="rounded p-1.5 text-muted hover:text-cream" aria-label="Edit"><Icon name="edit" className="w-4 h-4" /></button>
                          <button onClick={() => setDel(i)} className="rounded p-1.5 text-muted hover:text-red-400" aria-label="Delete"><Icon name="trash" className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>

      <Modal open={!!editing} onClose={() => { setEditing(null); setEditId(null); }} title={editId ? "Edit Menu Item" : "Add Menu Item"} wide>
        {editing && (
          <form onSubmit={saveItem} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Item Name" required>
                <input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
              </Field>
              <Field label="Category" required>
                <select className={inputCls} value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: Number(e.target.value) })} required>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Price (৳)" required>
                <input className={inputCls} type="number" min={0} value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} required />
              </Field>
              <Field label="Display Order">
                <input className={inputCls} type="number" value={editing.sort} onChange={(e) => setEditing({ ...editing, sort: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Short Description">
              <textarea className={`${inputCls} min-h-20`} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <Field label="Image">
              <ImagePicker value={editing.image} onChange={(url) => setEditing({ ...editing, image: url })} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-cream">
              <input type="checkbox" checked={editing.available} onChange={(e) => setEditing({ ...editing, available: e.target.checked })} className="h-4 w-4 accent-[#d8432a]" />
              Available for ordering
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setEditing(null); setEditId(null); }} className="rounded-lg border border-line px-4 py-2.5 text-sm text-muted hover:text-cream">Cancel</button>
              <SaveButton busy={busy} label={editId ? "Update Item" : "Add Item"} />
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!del} title="Delete menu item?" message={`Delete “${del?.name}”? This cannot be undone.`} confirmText="Delete" danger busy={busy} onConfirm={removeItem} onClose={() => setDel(null)} />
    </div>
  );
}
