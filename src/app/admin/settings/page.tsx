"use client";
import { useEffect, useState } from "react";
import { Field, Icon, Spinner, inputCls, useToast } from "@/components/ui";
import { Card, PageHeader, SaveButton, api } from "@/components/admin";

type Hours = { day: string; open: string; close: string; closed: boolean };

export default function SettingsPage() {
  const toast = useToast();
  const [wa, setWa] = useState("");
  const [mapsEmbed, setMapsEmbed] = useState("");
  const [hours, setHours] = useState<Hours[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cur, setCur] = useState("");
  const [np, setNp] = useState("");

  useEffect(() => {
    Promise.all([api<Record<string, string>>("/api/admin/content"), api<{ name: string; email: string }>("/api/admin/profile")])
      .then(([c, p]) => {
        setWa(c["contact.whatsapp"] || "");
        setMapsEmbed(c["contact.mapsEmbed"] || "");
        try {
          const h = JSON.parse(c["hours"] || "[]");
          if (Array.isArray(h)) setHours(h);
        } catch { /* ignore */ }
        setName(p.name);
        setEmail(p.email);
      })
      .catch(() => toast("Failed to load settings", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("contact");
    try {
      await api("/api/admin/content", { method: "PUT", body: JSON.stringify({ "contact.whatsapp": wa, "contact.mapsEmbed": mapsEmbed, "social.whatsapp": wa }) });
      toast("Settings saved — WhatsApp & map updated live.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setBusy(null);
    }
  };

  const saveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("hours");
    try {
      await api("/api/admin/content", { method: "PUT", body: JSON.stringify({ hours: JSON.stringify(hours) }) });
      toast("Opening hours updated.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setBusy(null);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("profile");
    try {
      await api("/api/admin/profile", { method: "PATCH", body: JSON.stringify({ name, email }) });
      toast("Profile updated.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setBusy(null);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("pass");
    try {
      await api("/api/admin/profile", { method: "PATCH", body: JSON.stringify({ currentPassword: cur, newPassword: np }) });
      toast("Password changed successfully.");
      setCur(""); setNp("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gold"><Spinner className="w-8 h-8" /></div>;

  return (
    <div>
      <PageHeader title="Restaurant Settings" sub="WhatsApp number, map, opening hours and admin security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 font-display text-xl text-cream"><Icon name="whatsapp" className="w-5 h-5 text-emerald-400" /> WhatsApp & Map</h2>
          <p className="mb-4 text-xs text-muted">Used for the floating button, booking chats and food orders.</p>
          <form onSubmit={saveContact} className="space-y-4">
            <Field label="WhatsApp Number (with country code)" hint="Digits only, e.g. 8801712345678" required>
              <input className={inputCls} value={wa} onChange={(e) => setWa(e.target.value.replace(/[^\d]/g, ""))} placeholder="8801XXXXXXXXX" />
            </Field>
            <Field label="Google Maps Embed URL" hint="Use …&output=embed links">
              <input className={inputCls} value={mapsEmbed} onChange={(e) => setMapsEmbed(e.target.value)} />
            </Field>
            <SaveButton busy={busy === "contact"} />
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 font-display text-xl text-cream"><Icon name="clock" className="w-5 h-5 text-gold" /> Opening Hours</h2>
          <p className="mb-4 text-xs text-muted">Shown in the footer and contact page.</p>
          <form onSubmit={saveHours}>
            <div className="space-y-2">
              {hours.map((h, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2">
                  <input className={inputCls} value={h.day} onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, day: e.target.value } : x)))} />
                  <input className={`${inputCls} w-28`} value={h.open} disabled={h.closed} onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)))} />
                  <input className={`${inputCls} w-28`} value={h.close} disabled={h.closed} onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)))} />
                  <label className="flex items-center gap-1 text-[11px] text-muted">
                    <input type="checkbox" checked={h.closed} onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, closed: e.target.checked } : x)))} className="accent-[#d8432a]" />
                    Closed
                  </label>
                  <button type="button" onClick={() => setHours(hours.filter((_, j) => j !== i))} className="rounded p-1.5 text-muted hover:text-red-400" aria-label="Remove day">
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => setHours([...hours, { day: "", open: "12:00 PM", close: "11:00 PM", closed: false }])} className="rounded-lg border border-line px-3 py-2 text-xs font-bold text-cream hover:border-gold/50">
                + Add Day
              </button>
              <SaveButton busy={busy === "hours"} />
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-cream"><Icon name="users" className="w-5 h-5 text-gold" /> Admin Profile</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Display Name">
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Login Email">
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <SaveButton busy={busy === "profile"} label="Save Profile" />
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-cream"><Icon name="lock" className="w-5 h-5 text-ember2" /> Change Password</h2>
          <form onSubmit={savePassword} className="space-y-4">
            <Field label="Current Password" required>
              <input className={inputCls} type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
            </Field>
            <Field label="New Password" hint="At least 6 characters" required>
              <input className={inputCls} type="password" value={np} onChange={(e) => setNp(e.target.value)} autoComplete="new-password" />
            </Field>
            <SaveButton busy={busy === "pass"} label="Update Password" />
          </form>
        </Card>
      </div>
    </div>
  );
}
