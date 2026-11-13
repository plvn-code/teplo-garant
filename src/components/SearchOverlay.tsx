"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { type Card, goods, img, price, searchCards } from "@/lib/format";
import { Icon } from "./Icons";

const QUICK = ["IRSAP Tesi", "Вертикальний", "Чорний", "22 тип", "Zehnder", "Vasco", "Рушникосушка", "Електрична", "ТЕН", "Термоголовка", "Кутовий кран", "Stelrad"];

let cache: Promise<Card[]> | null = null;
const load = () => (cache ??= fetch("/search.json").then((r) => r.json()).catch(() => ((cache = null), [])));

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { add } = useCart();

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<{ q?: string }>).detail;
      setQ(d?.q ?? "");
      setOpen(true);
      load().then(setCards);
    };
    window.addEventListener("open-search", onOpen);
    return () => window.removeEventListener("open-search", onOpen);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("search-open", open);
    if (!open) return;
    const t = window.setTimeout(() => input.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo(() => searchCards(cards, q, 40), [cards, q]);
  const popular = useMemo(() => cards.filter((c) => (c.hot || c.o) && c.img).slice(0, 8), [cards]);
  const shown = q.trim() ? results : popular;

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const all = () => router.push(`/katalog?q=${encodeURIComponent(q.trim())}`);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(shown.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = shown[sel];
      if (c && (sel > 0 || !q.trim() || results.length < 4)) router.push(`/tovar/${c.s}`);
      else if (q.trim()) all();
      else if (c) router.push(`/tovar/${c.s}`);
    }
  };

  return (
    <div className={`search ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Пошук товарів" inert={!open}>
      <div className="search-scrim" onClick={() => setOpen(false)} />
      <div className="search-panel">
        <div className="search-field">
          <Icon name="search" size={22} />
          <input
            ref={input}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Модель, бренд, колір або розмір: «Tesi 1800», «чорний», «500×1000»…"
            aria-label="Пошук"
            aria-controls="search-results"
            aria-activedescendant={shown[sel] ? `sr-${shown[sel].id}` : undefined}
            enterKeyHint="search"
            autoComplete="off"
          />
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Закрити пошук">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="search-chips">
          {QUICK.map((w) => (
            <button key={w} type="button" className={`chip chip-sm ${q === w ? "is-on" : ""}`} onClick={() => setQ(w)}>
              {w}
            </button>
          ))}
        </div>

        <p className="search-meta" aria-live="polite">
          {!cards.length ? "Завантажуємо каталог…" : q.trim() ? (results.length ? `Знайдено ${goods(results.length)}${results.length === 40 ? "+" : ""}` : "Нічого не знайшли — спробуйте інше слово або назву бренду") : "Хіти та акції"}
        </p>

        <ul className="search-results" id="search-results" ref={list} role="listbox">
          {shown.map((c, i) => (
            <li key={c.id} id={`sr-${c.id}`} data-i={i} role="option" aria-selected={i === sel} className={i === sel ? "is-sel" : ""} onMouseEnter={() => setSel(i)}>
              <Link href={`/tovar/${c.s}`} className="sr-link">
                <span className={`sr-img ${c.k === "p" ? "is-photo" : ""}`}>{c.img ? <img src={img(c.id, true)} alt="" loading="lazy" /> : null}</span>
                <span className="sr-text">
                  {c.bn && <small>{c.bn}</small>}
                  <span>{c.n}</span>
                </span>
                <span className="sr-price">{price(c.p)}</span>
              </Link>
              {c.p > 0 && (
                <button type="button" className="icon-btn sr-add" onClick={(e) => add(c, 1, e.currentTarget)} aria-label={`У кошик: ${c.n}`}>
                  <Icon name="plus" size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>

        {q.trim() && results.length > 0 && (
          <button type="button" className="btn btn-outline search-all" onClick={all}>
            Усі результати в каталозі <Icon name="arrow" size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
