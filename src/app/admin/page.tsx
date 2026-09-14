"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, EmptyState, Icon, Spinner, type IconName } from "@/components/ui";
import { Card, PageHeader, api } from "@/components/admin";

type Dash = {
  bookings: { total: number; pending: number; confirmed: number; cancelled: number };
  menu: { total: number; stockOut: number };
  offers: { active: number };
  recent: {
    id: number;
    code: string;
    name: string;
    ceremonyType: string;
    eventDate: string;
    status: string;
    createdAt: string;
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Dash>("/api/admin/dashboard").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <EmptyState icon="x" title="Could not load dashboard" message={error} />;
  if (!data)
    return (
      <div className="flex h-64 items-center justify-center text-gold">
        <Spinner className="w-8 h-8" />
      </div>
    );

  const cards: { label: string; value: number; icon: IconName; tone: string }[] = [
    { label: "Total Bookings", value: data.bookings.total, icon: "calendar", tone: "text-gold2 bg-gold/10 border-gold/30" },
    { label: "Pending", value: data.bookings.pending, icon: "clock", tone: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
    { label: "Confirmed", value: data.bookings.confirmed, icon: "check", tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
    { label: "Cancelled", value: data.bookings.cancelled, icon: "x", tone: "text-red-300 bg-red-500/10 border-red-500/30" },
    { label: "Menu Items", value: data.menu.total, icon: "bowl", tone: "text-cream bg-ink2 border-line" },
    { label: "Stock Out", value: data.menu.stockOut, icon: "tag", tone: "text-red-300 bg-red-500/10 border-red-500/30" },
    { label: "Active Offers", value: data.offers.active, icon: "spark", tone: "text-ember2 bg-ember/10 border-ember/30" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        sub="Overview of bookings, menu and offers at a glance."
        action={
          <Link href="/admin/bookings" className="rounded-lg bg-ember px-4 py-2.5 text-sm font-bold text-white hover:bg-ember2">
            Manage Bookings
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border ${c.tone}`}>
              <Icon name={c.icon} className="w-4 h-4" />
            </span>
            <p className="font-display text-3xl text-cream">{c.value}</p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-xl text-cream">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs font-bold text-gold2 hover:underline">View all</Link>
          </div>
          {data.recent.length === 0 ? (
            <div className="p-5"><EmptyState icon="calendar" title="No bookings yet" message="New ceremony requests will appear here." /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
                    <th className="px-5 py-3">Booking</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Ceremony</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.recent.map((b) => (
                    <tr key={b.id} className="hover:bg-ink2/50">
                      <td className="px-5 py-3 font-mono text-xs text-gold2">{b.code}</td>
                      <td className="px-5 py-3 text-cream">{b.name}</td>
                      <td className="px-5 py-3 text-muted">{b.ceremonyType}</td>
                      <td className="px-5 py-3 text-muted">{b.eventDate}</td>
                      <td className="px-5 py-3"><Badge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-display text-xl text-cream">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/menu", icon: "bowl" as IconName, t: "Add or edit menu items" },
              { href: "/admin/offers", icon: "tag" as IconName, t: "Manage special offers" },
              { href: "/admin/gallery", icon: "image" as IconName, t: "Update gallery photos" },
              { href: "/admin/content", icon: "edit" as IconName, t: "Edit website content" },
              { href: "/admin/settings", icon: "settings" as IconName, t: "WhatsApp, hours & security" },
            ].map((q) => (
              <Link key={q.href} href={q.href} className="flex items-center gap-3 rounded-lg border border-line bg-coal/40 px-4 py-3 text-sm text-muted transition hover:border-gold/40 hover:text-cream">
                <Icon name={q.icon} className="w-4 h-4 text-gold" /> {q.t}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
