"use client";
import { useEffect, useState } from "react";
import { Field, Spinner, inputCls, useToast } from "@/components/ui";
import { Card, ImagePicker, PageHeader, SaveButton, api } from "@/components/admin";

type Content = Record<string, string>;

const GROUPS: { title: string; keys: { key: string; label: string; type?: "text" | "textarea" | "image" }[] }[] = [
  {
    title: "Branding & SEO",
    keys: [
      { key: "brand.logoText", label: "Logo Text" },
      { key: "brand.tagline", label: "Tagline (under logo)" },
      { key: "site.title", label: "Website Title (SEO)" },
      { key: "site.description", label: "Meta Description (SEO)", type: "textarea" },
    ],
  },
  {
    title: "Hero Section",
    keys: [
      { key: "hero.image", label: "Hero Background Image", type: "image" },
      { key: "hero.eyebrow", label: "Eyebrow Text" },
      { key: "hero.title", label: "Headline" },
      { key: "hero.subtitle", label: "Subtitle", type: "textarea" },
      { key: "hero.ctaPrimaryText", label: "Primary CTA Text" },
      { key: "hero.ctaPrimaryLink", label: "Primary CTA Link" },
      { key: "hero.ctaSecondaryText", label: "Secondary CTA Text" },
      { key: "hero.ctaSecondaryLink", label: "Secondary CTA Link" },
    ],
  },
  {
    title: "About Section",
    keys: [
      { key: "about.heading", label: "Heading" },
      { key: "about.body", label: "Paragraphs (one per line)", type: "textarea" },
      { key: "about.image", label: "About Image", type: "image" },
      { key: "about.ctaText", label: "Button Text" },
      { key: "about.ctaLink", label: "Button Link" },
    ],
  },
  {
    title: "Ceremony Intro",
    keys: [{ key: "ceremony.intro", label: "Ceremony Page Introduction", type: "textarea" }],
  },
  {
    title: "Contact",
    keys: [
      { key: "contact.address", label: "Address" },
      { key: "contact.phone", label: "Phone" },
      { key: "contact.email", label: "Email" },
      { key: "contact.mapsUrl", label: "Google Maps Link" },
    ],
  },
  {
    title: "Social Links",
    keys: [
      { key: "social.facebook", label: "Facebook URL" },
      { key: "social.instagram", label: "Instagram URL" },
    ],
  },
  {
    title: "Footer",
    keys: [
      { key: "footer.text", label: "Footer Text", type: "textarea" },
      { key: "footer.copyright", label: "Copyright Text" },
    ],
  },
];

export default function ContentPage() {
  const toast = useToast();
  const [data, setData] = useState<Content>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Content>("/api/admin/content").then((d) => setData(d)).catch(() => toast("Failed to load content", "error")).finally(() => setLoading(false));
  }, [toast]);

  const set = (key: string, value: string) => setData((d) => ({ ...d, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // about.body: convert line breaks to JSON paragraphs
      const payload: Content = { ...data };
      payload["about.body"] = JSON.stringify(
        (data["about.body"] || "").split(/\n+/).map((s) => s.trim()).filter(Boolean)
      );
      await api("/api/admin/content", { method: "PUT", body: JSON.stringify(payload) });
      toast("Website content updated — changes are live.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gold"><Spinner className="w-8 h-8" /></div>;

  // show stored paragraphs as editable lines
  const aboutLines = (() => {
    try {
      const arr = JSON.parse(data["about.body"] || "[]");
      return Array.isArray(arr) ? arr.join("\n") : data["about.body"] || "";
    } catch {
      return data["about.body"] || "";
    }
  })();

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Website Content"
        sub="Everything here is live on the customer website the moment you save."
        action={<SaveButton busy={busy} />}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {GROUPS.map((g) => (
          <Card key={g.title} className="p-5">
            <h2 className="mb-4 font-display text-xl text-cream">{g.title}</h2>
            <div className="space-y-4">
              {g.keys.map((k) => {
                const value = k.key === "about.body" ? aboutLines : data[k.key] || "";
                if (k.type === "image")
                  return (
                    <Field key={k.key} label={k.label}>
                      <ImagePicker value={value} onChange={(url) => set(k.key, url)} />
                    </Field>
                  );
                if (k.type === "textarea")
                  return (
                    <Field key={k.key} label={k.label}>
                      <textarea className={`${inputCls} min-h-24`} value={value} onChange={(e) => set(k.key, e.target.value)} />
                    </Field>
                  );
                return (
                  <Field key={k.key} label={k.label}>
                    <input className={inputCls} value={value} onChange={(e) => set(k.key, e.target.value)} />
                  </Field>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <SaveButton busy={busy} />
      </div>
    </form>
  );
}
