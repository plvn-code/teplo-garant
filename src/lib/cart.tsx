"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Card } from "./format";

/** A cart line keeps a snapshot of the card, so the drawer renders without loading the catalogue. Prices are re-checked on the server. */
export type Line = { id: number; s: string; n: string; p: number; v: string | null; bn: string | null; qty: number };

type Toast = { key: number; name: string; id: number } | null;

type Ctx = {
  lines: Line[];
  count: number;
  total: number;
  ready: boolean;
  open: boolean;
  toast: Toast;
  setOpen: (v: boolean) => void;
  add: (c: Card | Line, qty?: number, from?: Element | null) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  qtyOf: (id: number) => number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "teplogarant-cart-v1";
const MAX = 99;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      try {
        setLines(e.newValue ? JSON.parse(e.newValue) : []);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  useEffect(() => {
    document.documentElement.classList.toggle("cart-open", open);
  }, [open]);

  const add = useCallback<Ctx["add"]>((c, qty = 1, from) => {
    setLines((ls) => {
      const i = ls.findIndex((l) => l.id === c.id);
      if (i >= 0) return ls.map((l, j) => (j === i ? { ...l, qty: Math.min(MAX, l.qty + qty) } : l));
      const line: Line = { id: c.id, s: c.s, n: c.n, p: c.p, v: "qty" in c ? c.v : c.d, bn: c.bn, qty };
      return [...ls, line];
    });
    flyToCart(c.id, from);
    window.clearTimeout(toastTimer.current);
    setToast({ key: Date.now(), name: c.n, id: c.id });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const setQty = useCallback((id: number, qty: number) => {
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.id !== id) : ls.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX, qty) } : l))));
  }, []);
  const remove = useCallback((id: number) => setLines((ls) => ls.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Ctx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const total = lines.reduce((n, l) => n + l.qty * l.p, 0);
    return {
      lines, count, total, ready, open, toast, setOpen, add, setQty, remove, clear,
      qtyOf: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
    };
  }, [lines, ready, open, toast, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}

/** A small copy of the product photo arcs from the button into the cart icon. */
function flyToCart(id: number, from?: Element | null) {
  if (!from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return bump();
  const target = [...document.querySelectorAll<HTMLElement>("[data-cart-target]")].find((el) => el.offsetParent !== null);
  if (!target) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dot = document.createElement("img");
  dot.src = `/images/p/${id}-0s.webp`;
  dot.alt = "";
  dot.className = "fly-dot";
  dot.onerror = () => dot.remove();
  document.body.appendChild(dot);
  const x0 = a.left + a.width / 2 - 28, y0 = a.top + a.height / 2 - 28;
  const x1 = b.left + b.width / 2 - 28, y1 = b.top + b.height / 2 - 28;
  const anim = dot.animate(
    [
      { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 120}px) scale(.8)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${x1}px, ${y1}px) scale(.2)`, opacity: 0.2 },
    ],
    { duration: 750, easing: "cubic-bezier(.5,0,.2,1)" },
  );
  anim.onfinish = () => {
    dot.remove();
    bump();
  };
}

function bump() {
  document.querySelectorAll("[data-cart-target]").forEach((el) => {
    el.classList.remove("is-bump");
    void (el as HTMLElement).offsetWidth;
    el.classList.add("is-bump");
  });
}
