import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope, Great_Vibes } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});
const vibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-vibes",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  const title = c["site.title"] || "China Garden – Premium Chinese Restaurant in Comilla";
  const description =
    c["site.description"] ||
    "Premium Chinese restaurant & ceremony venue at Planet SR, Comilla, Bangladesh.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "China Garden",
      type: "website",
      locale: "en_US",
      images: c["hero.image"] ? [{ url: c["hero.image"] }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable} ${vibes.variable}`}>
      <body className="bg-coal text-cream font-body antialiased">{children}</body>
    </html>
  );
}
