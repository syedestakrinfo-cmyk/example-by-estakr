"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog, EmptyState, Field, Icon, Img, Modal, Spinner, inputCls, useToast } from "@/components/ui";
import { PageHeader, api, uploadImage } from "@/components/admin";

type G = { id: number; url: string; caption: string | null; sort: number };

export default function GalleryPage() {
  const toast = useToast();
  const [rows, setRows] = useState<G[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [captionFor, setCaptionFor] = useState<G | null>(null);
  const [caption, setCaption] = useState("");
  const [del, setDel] = useState<G | null>(null);
  const [urlAdd, setUrlAdd] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setRows(await api<G[]>("/api/admin/gallery"));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const persistOrder = async (next: G[]) => {
    setRows(next);
    await api("/api/admin/gallery", { method: "PATCH", body: JSON.stringify({ order: next.map((r) => r.id) }) });
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...rows];
    const other = idx + dir;
    if (other < 0 || other >= next.length) return;
    [next[idx], next[other]] = [next[other], next[idx]];
    await persistOrder(next);
  };

  const onUpload = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      const url = await uploadImage(f);
      await api("/api/admin/gallery", { method: "POST", body: JSON.stringify({ url }) });
      toast("Image uploaded to gallery.");
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlAdd.trim()) return;
    setBusy(true);
    await api("/api/admin/gallery", { method: "POST", body: JSON.stringify({ url: urlAdd.trim() }) });
    setUrlAdd("");
    toast("Image added to gallery.");
    await load();
    setBusy(false);
  };

  const saveCaption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captionFor) return;
    await api(`/api/admin/gallery/${captionFor.id}`, { method: "PATCH", body: JSON.stringify({ caption }) });
    toast("Caption updated.");
    setCaptionFor(null);
    await load();
  };

  const remove = async () => {
    if (!del) return;
    setBusy(true);
    await api(`/api/admin/gallery/${del.id}`, { method: "DELETE" });
    toast("Image removed from gallery.");
    setDel(null); await load(); setBusy(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gold"><Spinner className="w-8 h-8" /></div>;

  return (
    <div>
      <PageHeader
        title="Gallery"
        sub="Upload, reorder and caption the photos shown on your website."
        action={
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
            <button onClick={() => fileRef.current?.click()} disabled={busy} className="flex items-center gap-2 rounded-lg bg-ember px-4 py-2.5 text-sm font-bold text-white hover:bg-ember2 disabled:opacity-60">
              {busy ? <Spinner className="w-4 h-4" /> : <Icon name="upload" className="w-4 h-4" />} Upload Image
            </button>
          </div>
        }
      />

      <form onSubmit={addUrl} className="mb-6 flex max-w-xl gap-2">
        <input value={urlAdd} onChange={(e) => setUrlAdd(e.target.value)} placeholder="…or paste an image URL to add" className={inputCls} />
        <button disabled={busy} className="shrink-0 rounded-lg border border-line px-4 text-sm font-bold text-cream hover:border-gold/50">Add</button>
      </form>

      {rows.length === 0 ? (
        <EmptyState icon="image" title="Gallery is empty" message="Upload your first photo above." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((g, idx) => (
            <div key={g.id} className="group relative overflow-hidden rounded-xl border border-line bg-ink">
              <Img src={g.url} alt={g.caption || "Gallery"} className="aspect-square w-full object-cover" />
              {g.caption && <p className="truncate px-3 py-2 text-xs text-muted">{g.caption}</p>}
              <div className="absolute inset-x-0 top-0 flex justify-between bg-gradient-to-b from-black/80 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  <button onClick={() => move(idx, -1)} className="rounded bg-black/60 p-1.5 text-white/80 hover:text-white" aria-label="Move earlier"><Icon name="up" className="w-3.5 h-3.5" /></button>
                  <button onClick={() => move(idx, 1)} className="rounded bg-black/60 p-1.5 text-white/80 hover:text-white" aria-label="Move later"><Icon name="down" className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setCaptionFor(g); setCaption(g.caption || ""); }} className="rounded bg-black/60 p-1.5 text-white/80 hover:text-white" aria-label="Edit caption"><Icon name="edit" className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDel(g)} className="rounded bg-black/60 p-1.5 text-red-300 hover:text-red-200" aria-label="Delete"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!captionFor} onClose={() => setCaptionFor(null)} title="Edit Caption / Replace">
        <form onSubmit={saveCaption} className="space-y-4">
          <Img src={captionFor?.url} alt="preview" className="h-40 w-full rounded-lg object-cover" />
          <Field label="Caption">
            <input className={inputCls} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCaptionFor(null)} className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-cream">Cancel</button>
            <button className="rounded-lg bg-ember px-4 py-2 text-sm font-bold text-white hover:bg-ember2">Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!del} title="Remove image?" message="Remove this image from the gallery?" confirmText="Remove" danger busy={busy} onConfirm={remove} onClose={() => setDel(null)} />
    </div>
  );
}
