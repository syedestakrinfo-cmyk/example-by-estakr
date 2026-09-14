"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Icon, Spinner, inputCls } from "@/components/ui";
import { LogoMark } from "@/components/site";
import { api } from "@/components/admin";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/auth", { method: "POST", body: JSON.stringify({ email, password }) });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-coal px-4">
      <div className="pattern-bg absolute inset-0 opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-ember/10 via-transparent to-transparent" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-ink text-gold">
            <LogoMark className="w-8 h-8" />
          </span>
          <h1 className="font-display text-3xl text-cream">China Garden</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-muted">Admin Sign In</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-line bg-ink p-6 shadow-2xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-300">
              <Icon name="x" className="w-4 h-4" /> {error}
            </div>
          )}
          <div className="space-y-4">
            <Field label="Email" required>
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@chinagarden.com" autoComplete="username" />
            </Field>
            <Field label="Password" required>
              <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </Field>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-ember px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-ember2 disabled:opacity-60"
          >
            {busy && <Spinner className="w-4 h-4" />}
            <Icon name="lock" className="w-4 h-4" /> Sign In
          </button>
          <p className="mt-4 rounded-lg border border-line bg-coal/60 px-3 py-2 text-center text-[11px] text-muted">
            Default: admin@chinagarden.com / admin123 — change it in Settings after signing in.
          </p>
        </form>
      </div>
    </div>
  );
}
