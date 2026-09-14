"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Icon, Img, Spinner, useToast } from "@/components/ui";
import { taka, waLink } from "@/lib/helpers";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string | null;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  inc: (id: number) => void;
  dec: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}

const LS_KEY = "cg_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const value = useMemo<CartCtx>(() => {
    const add = (item: Omit<CartItem, "qty">) =>
      setItems((prev) => {
        const found = prev.find((p) => p.id === item.id);
        if (found) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
        return [...prev, { ...item, qty: 1 }];
      });
    const inc = (id: number) =>
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));
    const dec = (id: number) =>
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p)));
    const remove = (id: number) => setItems((prev) => prev.filter((p) => p.id !== id));
    const clear = () => setItems([]);
    return {
      items,
      add,
      inc,
      dec,
      remove,
      clear,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
      open,
      setOpen,
    };
  }, [items, open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}

function CartDrawer() {
  const { items, open, setOpen, inc, dec, remove, total, clear } = useCart();
  const toast = useToast();
  const [wa, setWa] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && !wa) {
      fetch("/api/content")
        .then((r) => r.json())
        .then((c) => setWa(c["contact.whatsapp"] || c["social.whatsapp"] || ""))
        .catch(() => {});
    }
  }, [open, wa]);

  const order = () => {
    if (!items.length) return;
    setSending(true);
    const lines = items.map(
      (i, idx) => `${idx + 1}. ${i.name} × ${i.qty}\n${taka(i.price * i.qty)}`
    );
    const msg =
      `Hello China Garden! 👋\n\nI would like to place an order.\n\nORDER DETAILS:\n\n` +
      lines.join("\n\n") +
      `\n\n----------------\nTotal: ${taka(total)}\n----------------\n\nPlease confirm my order.\n\nThank you!`;
    window.open(waLink(wa, msg), "_blank", "noopener");
    toast("Opening WhatsApp with your order…", "info");
    setSending(false);
  };

  return (
    <div className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-ink shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="font-display text-2xl text-cream">Your Order</h3>
            <p className="text-xs text-muted">Review your selection before ordering</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-muted hover:bg-ink2 hover:text-cream"
            aria-label="Close cart"
          >
            <Icon name="x" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink2 text-gold">
              <Icon name="cart" className="w-7 h-7" />
            </div>
            <p className="font-display text-xl text-cream">Your cart is empty</p>
            <p className="text-sm text-muted">Browse the menu and add your favourite dishes.</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-ember px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember2"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((i) => (
                  <li key={i.id} className="flex gap-3 rounded-xl border border-line bg-coal/50 p-3">
                    <Img src={i.image} alt={i.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-cream">{i.name}</p>
                        <button
                          onClick={() => remove(i.id)}
                          className="shrink-0 rounded p-1 text-muted hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Remove ${i.name}`}
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gold">{taka(i.price)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-line">
                          <button
                            onClick={() => dec(i.id)}
                            className="px-2 py-1 text-muted hover:text-cream"
                            aria-label="Decrease quantity"
                          >
                            <Icon name="minus" className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-cream">{i.qty}</span>
                          <button
                            onClick={() => inc(i.id)}
                            className="px-2 py-1 text-muted hover:text-cream"
                            aria-label="Increase quantity"
                          >
                            <Icon name="plus" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-cream">{taka(i.price * i.qty)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={clear}
                className="mt-4 text-xs text-muted underline-offset-2 hover:text-red-400 hover:underline"
              >
                Clear cart
              </button>
            </div>
            <footer className="border-t border-line px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted">Grand Total</span>
                <span className="font-display text-2xl text-gold2">{taka(total)}</span>
              </div>
              <button
                onClick={order}
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1faa53] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:brightness-110 disabled:opacity-60"
              >
                {sending ? <Spinner className="w-4 h-4" /> : <Icon name="whatsapp" className="w-5 h-5" />}
                Order via WhatsApp
              </button>
              <p className="mt-2 text-center text-[11px] text-muted">
                Your order opens in WhatsApp — just press send.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
