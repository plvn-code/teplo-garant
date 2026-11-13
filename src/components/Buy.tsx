"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { type Card, discount, img, price } from "@/lib/format";
import { openCallback } from "./Callback";
import { Icon } from "./Icons";
import { Stock } from "./ProductCard";

type Shot = [string, number];

/** Photo gallery: big stage (follows the cursor in 3D, zoom lens on hover) + thumbnails; arrows and swipe on phones. */
export function Gallery({ c, shots }: { c: Card; shots: Shot[] }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [touch, setTouch] = useState<number | null>(null);
  if (!shots.length)
    return (
      <div className="pstage pstage-empty">
        <Icon name="flame" size={60} stroke={1} />
        <p>Фото уточнюйте в менеджера</p>
      </div>
    );
  const src = img(c.id, false, i);
  const pack = shots[i]?.[0] === "w";
  const go = (d: number) => setI((n) => (n + d + shots.length) % shots.length);
  return (
    <div className="gallery">
      <div
        className={`pstage ${zoom ? "is-zoom" : ""} ${pack ? "is-pack" : "is-photo"}`}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          e.currentTarget.style.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
          e.currentTarget.style.setProperty("--ry", `${((x - 0.5) * 6).toFixed(2)}deg`);
          setZoom({ x, y });
        }}
        onPointerLeave={() => setZoom(null)}
        onTouchStart={(e) => setTouch(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch === null) return;
          const dx = e.changedTouches[0].clientX - touch;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          setTouch(null);
        }}
      >
        <img key={src} className={`pstage-img ${pack ? "is-pack" : "is-photo"}`} src={src} alt={c.n} fetchPriority={i === 0 ? "high" : undefined} />
        {zoom && <div className="pstage-lens" aria-hidden="true" style={{ left: `${zoom.x * 100}%`, top: `${zoom.y * 100}%`, backgroundImage: `url(${src})`, backgroundPosition: `${zoom.x * 100}% ${zoom.y * 100}%` }} />}
        {discount(c) > 0 && <span className="badge badge-sale pstage-badge">−{discount(c)}%</span>}
        <span className="pstage-hint" aria-hidden="true">
          <Icon name="search" size={14} /> Наведіть, щоб збільшити
        </span>
        {shots.length > 1 && (
          <>
            <button type="button" className="icon-btn pstage-nav is-prev" onClick={() => go(-1)} aria-label="Попереднє фото">
              <Icon name="chevronLeft" size={20} />
            </button>
            <button type="button" className="icon-btn pstage-nav is-next" onClick={() => go(1)} aria-label="Наступне фото">
              <Icon name="chevronRight" size={20} />
            </button>
            <span className="pstage-count" aria-hidden="true">
              {i + 1} / {shots.length}
            </span>
          </>
        )}
      </div>
      {shots.length > 1 && (
        <div className="thumbs" role="tablist" aria-label="Фото товару">
          {shots.map((s, n) => (
            <button key={n} type="button" role="tab" aria-selected={n === i} className={`thumb ${n === i ? "is-on" : ""} ${s[0] === "w" ? "is-pack" : ""}`} onClick={() => setI(n)} aria-label={`Фото ${n + 1}`}>
              <img src={img(c.id, n < 2, n)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Variants({ groups }: { groups: { t: string; o: { v: string; s: string; on: boolean }[] }[] }) {
  if (!groups.length) return null;
  return (
    <div className="variants">
      {groups.map((g) => (
        <div className="variant" key={g.t}>
          <p className="variant-h">{g.t}</p>
          <div className="variant-opts">
            {[...g.o]
              .sort((a, b) => (parseFloat(a.v) || 0) - (parseFloat(b.v) || 0))
              .map((o) =>
                o.on ? (
                  <span key={o.s + o.v} className="chip chip-sm is-on" aria-current="true">
                    {o.v}
                  </span>
                ) : (
                  <Link key={o.s + o.v} href={`/tovar/${o.s}`} className="chip chip-sm" scroll={false}>
                    {o.v}
                  </Link>
                ),
              )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BuyBox({ c }: { c: Card }) {
  const { add, qtyOf, setOpen, ready } = useCart();
  const [qty, setQty] = useState(1);
  const inCart = ready ? qtyOf(c.id) : 0;
  const off = discount(c);
  return (
    <div className="buy">
      <div className="buy-top">
        <Stock st={c.st} />
        {c.st ? <span className="buy-eta">Відвантаження за 1–2 дні</span> : <span className="buy-eta">Термін постачання уточнить менеджер</span>}
      </div>
      <div className="buy-price">
        <b className={c.o ? "is-sale" : ""}>{price(c.p)}</b>
        {c.o && (
          <span className="buy-old">
            <s>{price(c.o)}</s>
            <em>Економія {price(c.o - c.p)} · −{off}%</em>
          </span>
        )}
      </div>
      <div className="buy-row">
        <div className="stepper stepper-lg" role="group" aria-label="Кількість">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Менше" disabled={qty <= 1}>
            <Icon name="minus" size={18} />
          </button>
          <output aria-live="polite">{qty}</output>
          <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Більше">
            <Icon name="plus" size={18} />
          </button>
        </div>
        <button type="button" className="btn btn-lg btn-glow buy-add" onClick={(e) => add(c, qty, e.currentTarget)}>
          <Icon name="bag" size={20} /> У кошик {qty > 1 && <small>· {price(c.p * qty)}</small>}
        </button>
      </div>
      {inCart > 0 && (
        <button type="button" className="buy-incart" onClick={() => setOpen(true)}>
          <Icon name="check" size={16} /> У кошику вже {inCart} шт. — оформити
        </button>
      )}
      <button type="button" className="btn btn-outline btn-lg btn-block" onClick={() => openCallback(`${c.n}${c.d ? ` (${c.d})` : ""} × ${qty}`)}>
        Купити в один клік
      </button>
    </div>
  );
}
