import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  admins,
  bookings,
  ceremonyTypes,
  galleryImages,
  menuCategories,
  menuItems,
  offers,
  siteContent,
} from "./schema";

/* ------------------------------------------------------------------ */
/* Image library (stock placeholders — replace from Admin Panel)       */
/* ------------------------------------------------------------------ */
const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=650&w=940`;

const HERO =
  "https://images.pexels.com/photos/10692546/pexels-photo-10692546.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600";
const ABOUT = px(8856502);
const CEREMONY = px(16935897);

const NOODLE = [12669951, 28895977, 28895978, 24243345, 9031955, 36701464, 2456434, 1028734].map(px);
const DISH = [31393438, 31297750, 5409017, 31264142, 11837281, 35211822, 37205632, 39494212, 18363406, 6646264].map(px);
const PIZZA = [33592997, 33592985, 8471699, 15953050, 8471739].map(px);
const CURRY = [17050759, 32083371, 31537385, 35267280, 29259138, 34080434, 31537384, 10810650].map(px);
const SWEET = [16052360, 11042364, 16052372, 13741431, 34623626, 9355885, 16052357, 29177176].map(px);
const INTERIOR = [8856502, 35985213, 8856579, 8856503, 8856678, 16935897, 17294718, 5669840].map(px);

const pick = (pool: string[], i: number) => pool[i % pool.length];

/* ------------------------------------------------------------------ */
/* Menu data transcribed from the China Garden menu board              */
/* ------------------------------------------------------------------ */
type Row = [name: string, price: number, desc?: string];
const MENU: { name: string; slug: string; pool: string[]; items: Row[] }[] = [
  {
    name: "Set Menu", slug: "set-menu", pool: DISH,
    items: [
      ["Set A", 280, "Fried Rice, Fried Chicken (Farm), Chinese Vegetable"],
      ["Set B", 380, "Fried Rice, Fried Chicken (Local), Chinese Vegetable"],
      ["Set C", 380, "Fried Rice, Fried Chicken (Farm), C. Vegetable, C. Masala"],
      ["Set D", 480, "Fried Rice, Fried Chicken (Local), C. Vegetable, C. Masala"],
      ["Set E", 350, "Fried Rice, Chicken Chili Onion, Chinese Vegetable"],
    ],
  },
  {
    name: "Pizza", slug: "pizza", pool: PIZZA,
    items: [
      ["China Garden Special Beef Pasta", 700, "Available in 8″ ৳700 · 10″ ৳880 · 12″ ৳1000"],
      ["Italian Pizza", 690, "Available in 8″ ৳690 · 10″ ৳830 · 12″ ৳900"],
      ["BBQ Phai Pasta", 800, "Available in 10″ ৳800 · 12″ ৳930"],
      ["Mexican Pasta", 730, "Available in 8″ ৳730 · 10″ ৳850 · 12″ ৳950"],
      ["Margarita Pizza", 800, "Available in 8″ ৳800 · 10″ ৳900 · 12″ ৳1100"],
      ["Thin Crust Pasta", 750, "Available in 8″ ৳750 · 10″ ৳850 · 12″ ৳950"],
    ],
  },
  {
    name: "Vegetable Dishes", slug: "vegetable-dishes", pool: NOODLE,
    items: [
      ["China Garden Special Vegetable", 390],
      ["China Garden Special Mixed Vegetables", 350],
      ["Thai Mixed Vegetables", 430],
      ["Chinese Vegetables (Chicken/Prawn)", 420],
      ["Bangkok Style Vegetable", 450],
    ],
  },
  {
    name: "Noodles", slug: "noodles", pool: NOODLE,
    items: [
      ["China Garden Special Chow Mein", 450],
      ["Mixed Noodles", 380],
      ["Sea-food Noodles", 430],
      ["Pad Thai Noodles (Chicken/Prawn)", 499],
      ["Chow Mein (Prawn/Chicken)", 450],
      ["American Chop-suey", 400],
    ],
  },
  {
    name: "Ramen", slug: "ramen", pool: NOODLE,
    items: [
      ["China Garden Special Ramen", 550],
      ["Vegetable Ramen", 399],
      ["Beef Ramen", 499],
      ["Mixed Ramen", 599],
    ],
  },
  {
    name: "Rice", slug: "rice", pool: DISH,
    items: [
      ["China Garden Special Fried Rice", 650],
      ["Mixed Fried Rice", 450],
      ["Vegetable Fried Rice", 300],
      ["Egg Fried Rice", 300],
      ["King Prawn Fried Rice", 750],
      ["Seafood Fried Rice", 550],
      ["Steam Rice", 80],
    ],
  },
  {
    name: "Appetizer", slug: "appetizer", pool: DISH,
    items: [
      ["Fried Spring Roll (Vegetable, 6 pcs)", 300],
      ["Mixed Tempura (12 pcs)", 499],
      ["French Fries (Imported)", 180],
      ["Potato Wedges", 200],
      ["Prawn Tempura", 499],
      ["Fried Prawn (8 pcs)", 450],
      ["Prawn on Toast/Chicken Toast", 499],
      ["BBQ Chicken Wings (8 pcs)", 350],
      ["Chicken Satay with Peanut Sauce (6 pcs)", 450],
      ["Fried Squid", 650],
      ["Fish Finger (6 pcs)", 360],
      ["Special Fried Wonton", 300],
    ],
  },
  {
    name: "Soup", slug: "soup", pool: [DISH[4], ...DISH],
    items: [
      ["China Garden Special Soup", 550],
      ["Thai Clear Soup", 450],
      ["Mixed Thai Soup (Thick)", 430],
      ["Special Chicken Corn Soup", 420],
      ["King Prawn Soup (Hot Pot)", 750],
      ["Sea-food Soup", 750],
      ["Cream of Mushroom Soup", 599],
      ["Vegetable Clear Soup", 399],
    ],
  },
  {
    name: "Indian Chicken Dishes", slug: "indian-chicken", pool: CURRY,
    items: [
      ["Chicken Tikka Masala", 370],
      ["Chicken Dopiazza", 370],
      ["Chicken Jalfrezi", 370],
      ["Chicken Bharta", 390],
    ],
  },
  {
    name: "Indian Beef Dishes", slug: "indian-beef", pool: CURRY,
    items: [
      ["Beef Masala", 480],
      ["Beef Achari", 480],
      ["Beef Dopiazza", 480],
      ["Peshawari Beef", 550],
    ],
  },
  {
    name: "Mutton Dishes", slug: "mutton", pool: CURRY,
    items: [
      ["Mutton Rogan Josh", 499],
      ["Mutton Masala", 499],
      ["Mutton Rezala", 499],
      ["Mutton Shahi Korma", 550],
    ],
  },
  {
    name: "Kebab", slug: "kebab", pool: [CURRY[4], ...CURRY],
    items: [
      ["Tandoori Chicken (2 cts)", 999],
      ["Chicken Tikka Kabab (6 pcs)", 480],
      ["Chicken Reshmi Kabab (6 pcs)", 480],
      ["Chicken Chicken (4 pcs)", 180],
      ["Tandoori Prawn", 550],
      ["Tandoori Pomfret", 800],
    ],
  },
  {
    name: "Naan & Roti", slug: "naan-roti", pool: [CURRY[5], ...CURRY],
    items: [
      ["Masala Kulcha", 180],
      ["Garlic Naan", 80],
      ["Butter Naan", 80],
      ["Plain Naan", 70],
    ],
  },
  {
    name: "Biryani / Polao", slug: "biryani", pool: [CURRY[2], CURRY[6], CURRY[3], CURRY[0]],
    items: [
      ["Hydrabadi Biriyani (Chicken/Mutton Half)", 800],
      ["Dum Biriyani (Chicken/Mutton Half)", 350],
      ["Morog Polao (For One)", 350],
      ["Achari Khichuri with Kala Bhuna", 550],
    ],
  },
  {
    name: "Vegetable / Dal", slug: "vegetable-dal", pool: CURRY,
    items: [
      ["Chinese Vegetables", 350],
      ["Shobji Bahar", 280],
      ["Mixed Shobji", 350],
      ["Yellow Dal", 150],
      ["Dal Butter Fry", 200],
    ],
  },
  {
    name: "Salad", slug: "salad", pool: DISH,
    items: [
      ["Chicken Prawn (Cashewnut Salad, Saucy)", 490],
      ["Lab Cai Salad (Minced Chicken)", 499],
      ["Mixed Seafood Salad", 550],
      ["Roast Chicken Salad", 480],
      ["Thai Beef Salad", 599],
    ],
  },
  {
    name: "Hot Beverage", slug: "hot-beverage", pool: SWEET,
    items: [
      ["Black Tea", 100],
      ["Milk Tea", 120],
      ["Coffee", 150],
      ["Cappuccino", 180],
      ["Espresso Single", 130],
      ["Espresso Double", 180],
      ["Americano", 160],
      ["Mocha", 250],
      ["Regular Coffee", 200],
      ["Vanilla Coffee", 220],
      ["Hazelnut Coffee", 250],
      ["Caramel Coffee", 250],
      ["Hot Chocolate", 250],
      ["Honey Coffee Latte", 250],
    ],
  },
  {
    name: "Chilled", slug: "chilled", pool: SWEET,
    items: [
      ["Cold Coffee", 180],
      ["Ice Latte", 200],
      ["Chocolate Coffee", 200],
      ["Ice Flavour Coffee", 200, "Regular ৳150"],
    ],
  },
  {
    name: "Soft Drinks", slug: "soft-drinks", pool: SWEET,
    items: [
      ["Mineral Water (500ml)", 20],
      ["Mineral Water (2 ltr)", 40],
      ["Coke/Sprite/Fanta (P.G.)", 50],
      ["Can Drinks", 50],
      ["Mineral Water (1.5 ltr)", 35],
    ],
  },
  {
    name: "Shake", slug: "shake", pool: SWEET,
    items: [
      ["Brownie Shake", 250],
      ["Nitels Shake", 220],
      ["Flavour Shake", 200],
      ["CM/V/Strawberry Shake", 250],
      ["Nutella Shake", 250],
      ["Kitkat Shake", 250],
    ],
  },
  {
    name: "Smoothie", slug: "smoothie", pool: SWEET,
    items: [
      ["Mango Smoothie", 300],
      ["Strawberry Smoothie", 300],
      ["Chocolate Smoothie", 300],
      ["Caramel Smoothie", 300],
      ["Blueberry Smoothie", 300],
      ["Hazel Nut Smoothie", 300],
      ["Vanilla Smoothie", 300],
    ],
  },
  {
    name: "Lassi", slug: "lassi", pool: SWEET,
    items: [
      ["Sweet Lassi", 150],
      ["Mango Lassi", 180],
      ["Chocolate Lassi", 150],
      ["Hazelnut Lassi", 180],
    ],
  },
  {
    name: "Fresh Juice", slug: "fresh-juice", pool: SWEET,
    items: [
      ["Orange Juice", 220],
      ["Papaya Juice", 120],
      ["Seasonal Juice", 180],
    ],
  },
  {
    name: "Dessert", slug: "dessert", pool: SWEET,
    items: [
      ["Chocolate Brownie", 150],
      ["Chocolate Lava Bomb", 450],
      ["Special Faluda", 300],
      ["Fruits Salad", 300],
      ["Moberry Single Saute", 250],
      ["Ice Cream Single Scoop", 70],
      ["Mocktail Ice Cream", 250],
    ],
  },
];

const CONTENT: Record<string, string> = {
  "brand.logoText": "China Garden",
  "brand.tagline": "Planet SR, Comilla",
  "brand.favicon": "",
  "site.title": "China Garden – Premium Chinese Restaurant in Comilla",
  "site.description":
    "China Garden at Planet SR, Comilla — exceptional Chinese cuisine, elegant dining and unforgettable ceremony celebrations. Book your wedding, birthday or corporate event today.",
  "hero.image": HERO,
  "hero.title": "Celebrate Your Special Moments at China Garden",
  "hero.subtitle":
    "Exceptional Chinese cuisine, elegant dining, and unforgettable celebrations in the heart of Comilla.",
  "hero.eyebrow": "Planet SR, Comilla · Bangladesh",
  "hero.ctaPrimaryText": "Book Your Ceremony",
  "hero.ctaPrimaryLink": "/ceremony",
  "hero.ctaSecondaryText": "Explore Our Menu",
  "hero.ctaSecondaryLink": "/menu",
  "about.heading": "A Refined Table in the Heart of Comilla",
  "about.body": JSON.stringify([
    "China Garden brings together the bold flavours of Chinese cuisine and the warmth of Bangladeshi hospitality under one elegant roof at Planet SR, Comilla. From sizzling wok-fired classics to slow-cooked Indian favourites, every plate is prepared to be remembered.",
    "Beyond everyday dining, China Garden is a destination for celebrations. Our dining rooms and private spaces are dressed for weddings, birthdays, anniversaries and corporate gatherings — with attentive service and menus tailored to your occasion.",
    "Whether you are joining us for a quiet dinner, a family feast, or the most important day of your life, our team is devoted to one simple promise: good food, good mood.",
  ]),
  "about.image": ABOUT,
  "about.ctaText": "Plan Your Ceremony",
  "about.ctaLink": "/ceremony",
  "contact.address": "Planet SR, Comilla, Bangladesh",
  "contact.phone": "+880 1700-000000",
  "contact.whatsapp": "8801700000000",
  "contact.email": "hello@chinagarden.comilla",
  "contact.facebook": "https://www.facebook.com/search/top?q=china%20garden%20comilla",
  "contact.mapsUrl": "https://www.google.com/maps/search/?api=1&query=Planet+SR+Comilla+Bangladesh",
  "contact.mapsEmbed": "https://www.google.com/maps?q=Planet%20SR%2C%20Comilla%2C%20Bangladesh&output=embed",
  "hours": JSON.stringify([
    { day: "Saturday", open: "12:00 PM", close: "11:00 PM", closed: false },
    { day: "Sunday", open: "12:00 PM", close: "11:00 PM", closed: false },
    { day: "Monday", open: "12:00 PM", close: "11:00 PM", closed: false },
    { day: "Tuesday", open: "12:00 PM", close: "11:00 PM", closed: false },
    { day: "Wednesday", open: "12:00 PM", close: "11:00 PM", closed: false },
    { day: "Thursday", open: "12:00 PM", close: "11:00 PM", closed: false },
    { day: "Friday", open: "3:00 PM", close: "11:30 PM", closed: false },
  ]),
  "social.facebook": "https://www.facebook.com/search/top?q=china%20garden%20comilla",
  "social.instagram": "",
  "social.whatsapp": "8801700000000",
  "footer.text": "Exceptional Chinese cuisine and unforgettable celebrations at Planet SR, Comilla.",
  "footer.copyright": "© 2026 China Garden. All rights reserved.",
  "ceremony.intro":
    "From intimate anniversaries to grand wedding receptions, China Garden is Comilla's home for celebrations that matter. Tell us about your occasion and our events team will craft the perfect evening for you.",
};

async function main() {
  console.log("Seeding database…");

  await db.delete(bookings);
  await db.delete(menuItems);
  await db.delete(menuCategories);
  await db.delete(offers);
  await db.delete(galleryImages);
  await db.delete(ceremonyTypes);
  await db.delete(siteContent);
  await db.delete(admins);

  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hash = await bcrypt.hash(password, 10);
  await db.insert(admins).values({
    email: process.env.ADMIN_EMAIL || "admin@chinagarden.com",
    name: "China Garden Admin",
    passwordHash: hash,
  });

  await db.insert(siteContent).values(
    Object.entries(CONTENT).map(([key, value]) => ({ key, value }))
  );

  const types = ["Wedding", "Birthday", "Anniversary", "Engagement", "Corporate Event", "Family Gathering", "Other"];
  await db.insert(ceremonyTypes).values(types.map((name, i) => ({ name, sort: i })));

  for (let c = 0; c < MENU.length; c++) {
    const cat = MENU[c];
    const [inserted] = await db
      .insert(menuCategories)
      .values({ name: cat.name, slug: cat.slug, sort: c, active: true })
      .returning({ id: menuCategories.id });
    const rows = cat.items.map(([name, price, description], i) => ({
      categoryId: inserted.id,
      name,
      price,
      description: description || "",
      image: pick(cat.pool, i),
      available: true,
      sort: i,
    }));
    await db.insert(menuItems).values(rows);
  }

  await db.insert(offers).values([
    {
      title: "Wedding Ceremony Special",
      description:
        "Make your special day even more memorable with our exclusive ceremony package — dedicated event coordination, custom menu tasting and elegant hall décor.",
      image: CEREMONY,
      discount: "20% OFF",
      startDate: "",
      endDate: "",
      active: true,
    },
    {
      title: "Family Feast Set Menu",
      description:
        "Gather the whole family around our signature set menus. Perfect for birthdays and family gatherings of six or more guests.",
      image: DISH[0],
      discount: "10% OFF",
      startDate: "",
      endDate: "",
      active: true,
    },
    {
      title: "Weekend Chef's Tasting",
      description:
        "Every Friday evening our wok chefs prepare a limited tasting journey of China Garden specials. Reserve your table early.",
      image: NOODLE[2],
      discount: "Fri Only",
      startDate: "",
      endDate: "",
      active: true,
    },
  ]);

  const gallery = [
    [INTERIOR[5], "Ceremony hall dressed for a wedding reception"],
    [NOODLE[2], "Signature wok-fired noodles, served sizzling"],
    [INTERIOR[0], "Candlelit dining room"],
    [PIZZA[1], "Wood-oven pizzas, baked to order"],
    [CURRY[2], "Slow-cooked biryani & curries"],
    [INTERIOR[6], "Private celebration table setting"],
    [DISH[1], "Golden appetizers, fried to order"],
    [INTERIOR[2], "The China Garden dining floor"],
    [SWEET[0], "Desserts & artisan coffee"],
    [INTERIOR[4], "Lounge seating for gatherings"],
    [CURRY[4], "Tandoor & kebab specialities"],
    [INTERIOR[7], "An evening at Planet SR"],
  ] as const;
  await db.insert(galleryImages).values(
    gallery.map(([url, caption], i) => ({ url, caption, sort: i }))
  );

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
