"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type Card, goods, searchCards } from "@/lib/format";
import { Icon } from "./Icons";
import { ProductCard } from "./ProductCard";

type Opt = { id: string; name: string; count?: number };
type Sort = "pop" | "asc" | "desc" | "sale" | "name";
const PAGE = 24;
const PRICES = [
  { id: "0-5", label: "до 5 000 ₴", min: 0, max: 5000 },
  { id: "5-15", label: "5–15 тис. ₴", min: 5000, max: 15000 },
  { id: "15-30", label: "15–30 тис. ₴", min: 15000, max: 30000 },
  { id: "30-", label: "від 30 тис. ₴", min: 30000, max: Infinity },
];
const COLORS: Record<string, string> = { Білий: "#f4f4f2", Чорний: "#15161a", Графіт: "#4a4d55", Хром: "linear-gradient(135deg,#f5f6f8,#9da3ad 45%,#eef0f3 60%,#7d838d)", Золото: "linear-gradient(135deg,#f3dd9a,#b8913f 50%,#f1d690)" };

/**
 * The catalogue grid with every filter in the URL (?sec ?sub ?brand ?price ?q ?sort), so a filtered view can be shared or bookmarked.
 * `fixed` pins the section (on /katalog/[section]) or the brand (on /brendy/[id]).
 */
export function Catalog({ cards, sections, subs, brands, fixed }: { cards: Card[]; sections?: Opt[]; subs?: Opt[]; brands: Opt[]; fixed?: "section" | "brand" }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sec = params.get("sec") ?? "";
  const sub = params.get("sub") ?? "";
  const brandSel = useMemo(() => (params.get("brand") ?? "").split(",").filter(Boolean), [params]);
  const pr = PRICES.find((p) => p.id === params.get("price"));
  const q = params.get("q") ?? "";
  const col = params.get("col") ?? "";
  const con = params.get("con") ?? "";
  const sale = params.get("sale") === "1";
  const stock = params.get("stock") === "1";
  const sort = (params.get("sort") as Sort) || "pop";
  const [shown, setShown] = useState(PAGE);
  const [sheet, setSheet] = useState(false);
  const [allBrands, setAllBrands] = useState(false);
  const [allSubs, setAllSubs] = useState(false);
  const [query, setQuery] = useState(q);

  useEffect(() => setQuery(q), [q]);
  useEffect(() => {
    document.documentElement.classList.toggle("sheet-open", sheet);
  }, [sheet]);

  const set = (patch: Record<string, string | null>) => {
    const u = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) u.set(k, v);
      else u.delete(k);
    }
    setShown(PAGE);
    router.replace(`${pathname}${u.size ? `?${u}` : ""}`, { scroll: false });
  };

  // Debounced search-as-you-type within the catalogue.
  useEffect(() => {
    if (query === q) return;
    const t = window.setTimeout(() => set({ q: query.trim() || null }), 280);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const base = useMemo(() => {
    let l = q ? searchCards(cards, q, 2000) : cards;
    if (sec) l = l.filter((c) => c.sec === sec);
    if (sub) l = l.filter((c) => c.sub === sub);
    if (pr) l = l.filter((c) => c.p >= pr.min && c.p < pr.max);
    if (col) l = l.filter((c) => c.col === col);
    if (con) l = l.filter((c) => c.con === con);
    if (sale) l = l.filter((c) => c.o);
    if (stock) l = l.filter((c) => c.st);
    return l;
  }, [cards, q, sec, sub, pr, col, con, sale, stock]);
  const colorOpts = useMemo(() => Object.keys(COLORS).map((id) => ({ id, n: cards.filter((c) => c.col === id).length })).filter((x) => x.n), [cards]);
  const conOpts = useMemo(() => ["Бічне", "Нижнє"].map((id) => ({ id, n: cards.filter((c) => c.con === id).length })).filter((x) => x.n), [cards]);

  // Brand counts reflect every other active filter.
  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of base) if (c.b) m.set(c.b, (m.get(c.b) ?? 0) + 1);
    return m;
  }, [base]);

  const list = useMemo(() => {
    let l = brandSel.length ? base.filter((c) => c.b && brandSel.includes(c.b)) : base;
    if (sort === "asc" || sort === "desc") {
      const priced = l.filter((c) => c.p).sort((a, b) => (sort === "asc" ? a.p - b.p : b.p - a.p));
      l = [...priced, ...l.filter((c) => !c.p)];
    } else if (sort === "sale") {
      l = [...l].sort((a, b) => (b.o ? 1 - b.p / b.o : 0) - (a.o ? 1 - a.p / a.o : 0));
    } else if (sort === "name") {
      l = [...l].sort((a, b) => a.n.localeCompare(b.n, "uk"));
    } else if (!q) {
      l = [...l].sort((a, b) => Number(!!b.hot) - Number(!!a.hot) || Number(!!b.o) - Number(!!a.o) || Number(b.st) - Number(a.st) || Number(b.img > 1) - Number(a.img > 1));
    }
    return l;
  }, [base, brandSel, sort, q]);

  const brandOpts = brands.filter((b) => brandCounts.get(b.id) || brandSel.includes(b.id)).sort((a, b) => (brandCounts.get(b.id) ?? 0) - (brandCounts.get(a.id) ?? 0));
  const visibleBrands = allBrands ? brandOpts : brandOpts.slice(0, 10);
  const toggleBrand = (id: string) => set({ brand: (brandSel.includes(id) ? brandSel.filter((b) => b !== id) : [...brandSel, id]).join(",") || null });
  const subOpts = subs ?? [];

  const active: { label: string; clear: () => void }[] = [
    ...(sec && sections ? [{ label: sections.find((s) => s.id === sec)?.name ?? sec, clear: () => set({ sec: null, sub: null }) }] : []),
    ...(sub ? [{ label: subOpts.find((s) => s.id === sub)?.name ?? sub, clear: () => set({ sub: null }) }] : []),
    ...brandSel.map((b) => ({ label: brands.find((x) => x.id === b)?.name ?? b, clear: () => toggleBrand(b) })),
    ...(pr ? [{ label: pr.label, clear: () => set({ price: null }) }] : []),
    ...(col ? [{ label: col, clear: () => set({ col: null }) }] : []),
    ...(con ? [{ label: `${con} підключення`, clear: () => set({ con: null }) }] : []),
    ...(sale ? [{ label: "Акції", clear: () => set({ sale: null }) }] : []),
    ...(stock ? [{ label: "В наявності", clear: () => set({ stock: null }) }] : []),
    ...(q ? [{ label: `«${q}»`, clear: () => set({ q: null }) }] : []),
  ];
  const resetAll = () => {
    setQuery("");
    router.replace(pathname, { scroll: false });
    setShown(PAGE);
  };

  const filters = (
    <>
      {sections && fixed !== "section" && (
        <div className="fgroup">
          <p className="fgroup-h">Розділ</p>
          <ul className="flist">
            <li>
              <button type="button" className={!sec ? "is-on" : ""} onClick={() => set({ sec: null, sub: null })}>
                Усі товари
              </button>
            </li>
            {sections.map((s) => (
              <li key={s.id}>
                <button type="button" className={sec === s.id ? "is-on" : ""} onClick={() => set({ sec: s.id, sub: null })}>
                  {s.name} <small>{s.count}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {fixed === "section" && subOpts.length > 1 && (
        <div className="fgroup">
          <p className="fgroup-h">Категорія</p>
          <ul className="flist">
            <li>
              <button type="button" className={!sub ? "is-on" : ""} onClick={() => set({ sub: null })}>
                Усі
              </button>
            </li>
            {(allSubs ? subOpts : subOpts.slice(0, 8)).concat(!allSubs && sub && subOpts.findIndex((x) => x.id === sub) >= 8 ? subOpts.filter((x) => x.id === sub) : []).map((s) => (
              <li key={s.id}>
                <button type="button" className={sub === s.id ? "is-on" : ""} onClick={() => set({ sub: s.id })}>
                  {s.name} <small>{s.count}</small>
                </button>
              </li>
            ))}
          </ul>
          {subOpts.length > 8 && (
            <button type="button" className="link-btn" onClick={() => setAllSubs((v) => !v)}>
              {allSubs ? "Згорнути" : `Показати всі (${subOpts.length})`}
            </button>
          )}
        </div>
      )}
      <div className="fgroup">
        <p className="fgroup-h">Ціна</p>
        <div className="fprices">
          {PRICES.map((p) => (
            <button key={p.id} type="button" className={`chip chip-sm ${pr?.id === p.id ? "is-on" : ""}`} onClick={() => set({ price: pr?.id === p.id ? null : p.id })}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="fgroup">
        <p className="fgroup-h">Пропозиції</p>
        <div className="fchecks">
          <label className="check">
            <input type="checkbox" checked={sale} onChange={() => set({ sale: sale ? null : "1" })} />
            <span className="check-box" aria-hidden="true">
              <Icon name="check" size={13} stroke={2.4} />
            </span>
            Зі знижкою
            <small>{cards.filter((c) => c.o).length}</small>
          </label>
          <label className="check">
            <input type="checkbox" checked={stock} onChange={() => set({ stock: stock ? null : "1" })} />
            <span className="check-box" aria-hidden="true">
              <Icon name="check" size={13} stroke={2.4} />
            </span>
            В наявності на складі
            <small>{cards.filter((c) => c.st).length}</small>
          </label>
        </div>
      </div>
      {colorOpts.length > 1 && (
        <div className="fgroup">
          <p className="fgroup-h">Колір</p>
          <div className="fswatches">
            {colorOpts.map((x) => (
              <button key={x.id} type="button" className={`swatch ${col === x.id ? "is-on" : ""}`} onClick={() => set({ col: col === x.id ? null : x.id })} aria-pressed={col === x.id}>
                <i style={{ background: COLORS[x.id] }} aria-hidden="true" />
                {x.id}
                <small>{x.n}</small>
              </button>
            ))}
          </div>
        </div>
      )}
      {conOpts.length > 1 && (
        <div className="fgroup">
          <p className="fgroup-h">Підключення</p>
          <div className="fprices">
            {conOpts.map((x) => (
              <button key={x.id} type="button" className={`chip chip-sm ${con === x.id ? "is-on" : ""}`} onClick={() => set({ con: con === x.id ? null : x.id })}>
                {x.id} <small>{x.n}</small>
              </button>
            ))}
          </div>
        </div>
      )}
      {fixed !== "brand" && brandOpts.length > 1 && (
        <div className="fgroup">
          <p className="fgroup-h">Бренд</p>
          <ul className="fchecks">
            {visibleBrands.map((b) => (
              <li key={b.id}>
                <label className="check">
                  <input type="checkbox" checked={brandSel.includes(b.id)} onChange={() => toggleBrand(b.id)} />
                  <span className="check-box" aria-hidden="true">
                    <Icon name="check" size={13} stroke={2.4} />
                  </span>
                  {b.name}
                  <small>{brandCounts.get(b.id) ?? 0}</small>
                </label>
              </li>
            ))}
          </ul>
          {brandOpts.length > 10 && (
            <button type="button" className="link-btn" onClick={() => setAllBrands((v) => !v)}>
              {allBrands ? "Згорнути" : `Показати всі (${brandOpts.length})`}
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="catalog">
      {fixed === "section" && subOpts.length > 1 && (
        <div className="chips chips-scroll" role="tablist" aria-label="Категорії">
          <button type="button" role="tab" aria-selected={!sub} className={`chip ${!sub ? "is-on" : ""}`} onClick={() => set({ sub: null })}>
            Усі <small>{cards.length}</small>
          </button>
          {subOpts.map((s) => (
            <button key={s.id} type="button" role="tab" aria-selected={sub === s.id} className={`chip ${sub === s.id ? "is-on" : ""}`} onClick={() => set({ sub: s.id })}>
              {s.name} <small>{s.count}</small>
            </button>
          ))}
        </div>
      )}

      <div className="catalog-bar">
        <label className="catalog-search">
          <Icon name="search" size={18} />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Модель, бренд або розмір: «Tesi 1800», «22 тип 500×1000»" aria-label="Пошук у каталозі" enterKeyHint="search" />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Очистити">
              <Icon name="close" size={16} />
            </button>
          )}
        </label>
        <button type="button" className="btn btn-outline catalog-filter-btn" onClick={() => setSheet(true)}>
          <Icon name="filter" size={18} /> Фільтри {active.length > 0 && <small className="pill">{active.length}</small>}
        </button>
        <label className="select">
          <span className="sr-only">Сортування</span>
          <select value={sort} onChange={(e) => set({ sort: e.target.value === "pop" ? null : e.target.value })}>
            <option value="pop">Популярні</option>
            <option value="asc">Дешевші</option>
            <option value="desc">Дорожчі</option>
            <option value="sale">Найбільша знижка</option>
            <option value="name">За назвою</option>
          </select>
          <Icon name="chevron" size={16} />
        </label>
      </div>

      <div className="catalog-layout">
        <aside className="catalog-side" aria-label="Фільтри">
          {filters}
        </aside>

        <div className="catalog-main">
          <div className="catalog-meta">
            <p aria-live="polite">
              <b>{goods(list.length)}</b>
            </p>
            {active.length > 0 && (
              <div className="active-filters">
                {active.map((a) => (
                  <button key={a.label} type="button" className="chip chip-sm is-on" onClick={a.clear}>
                    {a.label} <Icon name="close" size={13} />
                  </button>
                ))}
                <button type="button" className="link-btn" onClick={resetAll}>
                  Скинути все
                </button>
              </div>
            )}
          </div>

          {list.length ? (
            <div className="grid">
              {list.slice(0, shown).map((c, i) => (
                <div key={c.id} className="grid-cell grid-in" style={{ ["--d" as string]: `${(i % PAGE) * 0.025}s` }}>
                  <ProductCard c={c} eager={i < 4} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Icon name="search" size={34} stroke={1.2} />
              <p>За цими фільтрами нічого не знайшлося.</p>
              <button type="button" className="btn btn-outline" onClick={resetAll}>
                Скинути фільтри
              </button>
            </div>
          )}

          {shown < list.length && (
            <div className="more">
              <p>
                Показано {Math.min(shown, list.length)} з {list.length}
              </p>
              <span className="more-bar" aria-hidden="true">
                <span style={{ width: `${(shown / list.length) * 100}%` }} />
              </span>
              <button type="button" className="btn btn-outline btn-lg" onClick={() => setShown((n) => n + PAGE)}>
                Показати ще {Math.min(PAGE, list.length - shown)}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`sheet ${sheet ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Фільтри" inert={!sheet}>
        <div className="sheet-scrim" onClick={() => setSheet(false)} />
        <div className="sheet-panel">
          <div className="sheet-head">
            <b>Фільтри</b>
            <button type="button" className="icon-btn" onClick={() => setSheet(false)} aria-label="Закрити">
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className="sheet-body">{filters}</div>
          <div className="sheet-foot">
            <button type="button" className="btn btn-ghost" onClick={resetAll}>
              Скинути
            </button>
            <button type="button" className="btn btn-glow" onClick={() => setSheet(false)}>
              Показати {goods(list.length)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
