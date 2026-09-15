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

type OrderType = "delivery" | "pickup" | "dine-in";

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

      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch {
      /* ignore */
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const value = useMemo<CartCtx>(() => {
    const add = (item: Omit<CartItem, "qty">) =>
      setItems((prev) => {
        const found = prev.find((p) => p.id === item.id);

        if (found) {
          return prev.map((p) =>
            p.id === item.id
              ? { ...p, qty: p.qty + 1 }
              : p
          );
        }

        return [...prev, { ...item, qty: 1 }];
      });

    const inc = (id: number) =>
      setItems((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, qty: p.qty + 1 }
            : p
        )
      );

    const dec = (id: number) =>
      setItems((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                qty: Math.max(1, p.qty - 1),
              }
            : p
        )
      );

    const remove = (id: number) =>
      setItems((prev) =>
        prev.filter((p) => p.id !== id)
      );

    const clear = () => setItems([]);

    return {
      items,
      add,
      inc,
      dec,
      remove,
      clear,
      count: items.reduce(
        (s, i) => s + i.qty,
        0
      ),
      total: items.reduce(
        (s, i) => s + i.qty * i.price,
        0
      ),
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
  const {
    items,
    open,
    setOpen,
    inc,
    dec,
    remove,
    total,
    clear,
  } = useCart();

  const toast = useToast();

  const [wa, setWa] = useState("");
  const [sending, setSending] = useState(false);

  const [customerName, setCustomerName] =
    useState("");

  const [phone, setPhone] = useState("");

  const [details, setDetails] =
    useState("");

  const [orderType, setOrderType] =
    useState<OrderType>("dine-in");

  useEffect(() => {
    if (open && !wa) {
      fetch("/api/content")
        .then((r) => r.json())
        .then((c) =>
          setWa(
            c["contact.whatsapp"] ||
              c["social.whatsapp"] ||
              ""
          )
        )
        .catch(() => {});
    }
  }, [open, wa]);

  const order = () => {
    if (!items.length) return;

    if (!customerName.trim()) {
      toast(
        "Please enter your name.",
        "info"
      );
      return;
    }

    if (!phone.trim()) {
      toast(
        "Please enter your phone number.",
        "info"
      );
      return;
    }

    if (
      orderType === "delivery" &&
      !details.trim()
    ) {
      toast(
        "Please enter your delivery address.",
        "info"
      );
      return;
    }

    setSending(true);

    const orderTypeLabel =
      orderType === "delivery"
        ? "Delivery 🚚"
        : orderType === "pickup"
        ? "Pickup 🥡"
        : "Dine In 🍽️";

    const lines = items.map(
      (i, idx) =>
        `${idx + 1}. ${i.name} × ${i.qty}\n${taka(
          i.price * i.qty
        )}`
    );

    const msg =
      `Hello China Garden! 👋\n\n` +
      `I would like to place an order.\n\n` +
      `CUSTOMER DETAILS:\n` +
      `Name: ${customerName.trim()}\n` +
      `Phone: ${phone.trim()}\n` +
      `Order Type: ${orderTypeLabel}\n` +
      `${
        details.trim()
          ? `Address / Details: ${details.trim()}\n`
          : ""
      }` +
      `\nORDER DETAILS:\n\n` +
      lines.join("\n\n") +
      `\n\n----------------\n` +
      `Total: ${taka(total)}\n` +
      `----------------\n\n` +
      `Please confirm my order.\n\n` +
      `Thank you!`;

    window.open(
      waLink(wa, msg),
      "_blank",
      "noopener"
    );

    toast(
      "Opening WhatsApp with your order…",
      "info"
    );

    setSending(false);
  };

  const orderTypeButton = (
    type: OrderType,
    title: string,
    subtitle: string
  ) => {
    const active = orderType === type;

    return (
      <button
        type="button"
        onClick={() => setOrderType(type)}
        className={`relative rounded-xl border p-3 text-left transition ${
          active
            ? "border-gold bg-gold/10"
            : "border-line bg-coal/40 hover:border-gold/40"
        }`}
      >
        {type === "dine-in" && (
          <span className="absolute -top-2 right-2 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-coal">
            Recommended
          </span>
        )}

        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              active
                ? "border-gold bg-gold"
                : "border-muted"
            }`}
          >
            {active && (
              <span className="h-2 w-2 rounded-full bg-coal" />
            )}
          </div>

          <div>
            <p
              className={`text-sm font-semibold ${
                active
                  ? "text-gold2"
                  : "text-cream"
              }`}
            >
              {title}
            </p>

            <p className="mt-0.5 text-[11px] text-muted">
              {subtitle}
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-[80] ${
        open
          ? ""
          : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100"
            : "opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-ink shadow-2xl transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="font-display text-2xl text-cream">
              Your Order
            </h3>

            <p className="text-xs text-muted">
              Review your selection before ordering
            </p>
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
              <Icon
                name="cart"
                className="h-7 w-7"
              />
            </div>

            <p className="font-display text-xl text-cream">
              Your cart is empty
            </p>

            <p className="text-sm text-muted">
              Browse the menu and add your favourite dishes.
            </p>

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
                  <li
                    key={i.id}
                    className="flex gap-3 rounded-xl border border-line bg-coal/50 p-3"
                  >
                    <Img
                      src={i.image}
                      alt={i.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-cream">
                          {i.name}
                        </p>

                        <button
                          onClick={() =>
                            remove(i.id)
                          }
                          className="shrink-0 rounded p-1 text-muted hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Remove ${i.name}`}
                        >
                          <Icon
                            name="trash"
                            className="h-4 w-4"
                          />
                        </button>
                      </div>

                      <p className="text-xs text-gold">
                        {taka(i.price)}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-line">
                          <button
                            onClick={() =>
                              dec(i.id)
                            }
                            className="px-2 py-1 text-muted hover:text-cream"
                            aria-label="Decrease quantity"
                          >
                            <Icon
                              name="minus"
                              className="h-3.5 w-3.5"
                            />
                          </button>

                          <span className="w-8 text-center text-sm font-semibold text-cream">
                            {i.qty}
                          </span>

                          <button
                            onClick={() =>
                              inc(i.id)
                            }
                            className="px-2 py-1 text-muted hover:text-cream"
                            aria-label="Increase quantity"
                          >
                            <Icon
                              name="plus"
                              className="h-3.5 w-3.5"
                            />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-cream">
                          {taka(
                            i.price * i.qty
                          )}
                        </span>
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

              <div className="mt-6 border-t border-line pt-5">
                <h4 className="mb-1 font-display text-xl text-cream">
                  Customer Details
                </h4>

                <p className="mb-4 text-xs text-muted">
                  Please provide your details before placing the order.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-cream/80">
                      Name *
                    </label>

                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) =>
                        setCustomerName(
                          e.target.value
                        )
                      }
                      placeholder="Your full name"
                      className="w-full rounded-lg border border-line bg-coal/60 px-3 py-2.5 text-sm text-cream outline-none placeholder:text-muted focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-cream/80">
                      Phone Number *
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="01XXXXXXXXX"
                      className="w-full rounded-lg border border-line bg-coal/60 px-3 py-2.5 text-sm text-cream outline-none placeholder:text-muted focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-cream/80">
                      How would you like to receive your order?
                    </label>

                    <div className="grid gap-2">
                      {orderTypeButton(
                        "delivery",
                        "Delivery",
                        "Have your order delivered to you"
                      )}

                      {orderTypeButton(
                        "pickup",
                        "Pickup",
                        "Pick up your order from the restaurant"
                      )}

                      {orderTypeButton(
                        "dine-in",
                        "Dine In",
                        "Enjoy your meal at China Garden"
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-cream/80">
                      {orderType === "delivery"
                        ? "Delivery Address *"
                        : "Additional Details"}
                    </label>

                    <textarea
                      value={details}
                      onChange={(e) =>
                        setDetails(
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder={
                        orderType === "delivery"
                          ? "Enter your complete delivery address"
                          : orderType === "pickup"
                          ? "Any special instructions?"
                          : "Table preference or any special request?"
                      }
                      className="w-full resize-none rounded-lg border border-line bg-coal/60 px-3 py-2.5 text-sm text-cream outline-none placeholder:text-muted focus:border-gold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <footer className="border-t border-line bg-ink px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted">
                  Grand Total
                </span>

                <span className="font-display text-2xl text-gold2">
                  {taka(total)}
                </span>
              </div>

              <button
                onClick={order}
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1faa53] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:brightness-110 disabled:opacity-60"
              >
                {sending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Icon
                    name="whatsapp"
                    className="h-5 w-5"
                  />
                )}

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