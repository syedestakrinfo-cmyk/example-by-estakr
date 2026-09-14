import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryImages, offers } from "@/db/schema";
import { getContent } from "@/lib/content";
import { AboutSection, ContactSection, GallerySection, OffersSection } from "@/components/sections";

export const dynamic = "force-dynamic";

const PAGES = ["about", "offers", "gallery", "contact"] as const;
type Slug = (typeof PAGES)[number];

const META: Record<Slug, { title: string; description: string }> = {
  about: {
    title: "About – China Garden | Premium Chinese Restaurant in Comilla",
    description: "The story of China Garden at Planet SR, Comilla — elegant dining, authentic flavours and a home for celebrations.",
  },
  offers: {
    title: "Special Offers – China Garden Comilla",
    description: "Current special offers and ceremony packages at China Garden, Planet SR Comilla.",
  },
  gallery: {
    title: "Gallery – China Garden Comilla",
    description: "Explore China Garden — our dishes, dining rooms and ceremony setups at Planet SR, Comilla.",
  },
  contact: {
    title: "Contact – China Garden | Planet SR, Comilla",
    description: "Find China Garden at Planet SR, Comilla. Call, WhatsApp or visit us — see opening hours and location map.",
  },
};

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then((p) => META[p.slug as Slug] || {});
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!PAGES.includes(slug as Slug)) notFound();
  const content = await getContent();

  if (slug === "about") {
    return (
      <div className="pt-8">
        <AboutSection content={content} full />
      </div>
    );
  }

  if (slug === "offers") {
    const rows = await db.select().from(offers).where(eq(offers.active, true)).orderBy(asc(offers.id));
    return (
      <div className="pt-8">
        <OffersSection offers={rows} />
      </div>
    );
  }

  if (slug === "gallery") {
    const rows = await db.select().from(galleryImages).orderBy(asc(galleryImages.sort));
    return (
      <div className="pt-8">
        <GallerySection images={rows} />
      </div>
    );
  }

  return (
    <div className="pt-8">
      <ContactSection content={content} />
    </div>
  );
}
