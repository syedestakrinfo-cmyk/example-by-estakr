import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { menuCategories, menuItems } from "@/db/schema";
import { MenuBrowser } from "@/components/booking-menu";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Menu – China Garden | Premium Chinese Restaurant in Comilla",
  description: "Browse the full China Garden menu — set menus, wok specials, ramen, biryani, kebabs, desserts and more. Add to cart and order via WhatsApp.",
};

export default async function MenuPage() {
  const categories = await db.select().from(menuCategories).where(eq(menuCategories.active, true)).orderBy(asc(menuCategories.sort));
  const items = await db.select().from(menuItems).orderBy(asc(menuItems.sort));

  return (
    <div className="relative py-16 sm:py-20">
      <div className="pattern-bg absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="font-script text-4xl text-ember2">Fresh & Tasty</p>
          <h1 className="mt-1 font-display text-5xl font-semibold text-cream sm:text-6xl">Our Menu</h1>
          <div className="mx-auto mt-4 h-px w-24 gold-line" />
          <p className="mx-auto mt-4 max-w-xl text-muted">Discover the flavours of China Garden — add your favourites to the cart and order instantly on WhatsApp.</p>
        </div>
        <MenuBrowser categories={categories} items={items} />
      </div>
    </div>
  );
}
