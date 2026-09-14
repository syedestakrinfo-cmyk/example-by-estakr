import type { ReactNode } from "react";
import { getContent } from "@/lib/content";
import { CartProvider } from "@/lib/cart";
import { ToastProvider } from "@/components/ui";
import { Navbar, Footer, FloatingWhatsApp } from "@/components/site";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const content = await getContent();
  return (
    <ToastProvider>
      <CartProvider>
        <Navbar content={content} />
        <main className="pt-[72px]">{children}</main>
        <Footer content={content} />
        <FloatingWhatsApp content={content} />
      </CartProvider>
    </ToastProvider>
  );
}
