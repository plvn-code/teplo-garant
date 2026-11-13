"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { type Card, discount, img, price } from "@/lib/format";
import { Icon } from "./Icons";

/** «Купити» turns into a −/+ stepper once the item is in the cart. */
export function AddToCart({ c, size = "md", label = "Купити" }: { c: Card; size?: "md" | "lg"; label?: string }) {
  const { add, qtyOf, setQty, ready } = useCart();
  const qty = ready ? qtyOf(c.id) : 0;
  if (!c.p) {
    return (
      <button type="button" className={`btn btn-outline ${size === "lg" ? "btn-lg" : "btn-sm"} add-btn`} onClick={() => window.dispatchEvent(new CustomEvent("open-callback", { detail: { product: c.n } }))}>
        Дізнатися ціну
      </button>
    );
  }
  if (qty > 0) {
    return (
      <div className={`stepper ${size === "lg" ? "stepper-lg" : ""}`} role="group" aria-label={`Кількість: ${c.n}`}>
        <button type="button" onClick={() => setQty(c.id, qty - 1)} aria-label="Менше">
          <Icon name="minus" size={16} />
        </button>
        <output aria-live="polite">{qty}</output>
        <button type="button" onClick={(e) => add(c, 1, e.currentTarget)} aria-label="Більше">
          <Icon name="plus" size={16} />
        </button>
      </div>
    );
  }
  return (
    <button type="button" className={`btn ${size === "lg" ? "btn-lg" : "btn-sm"} add-btn`} onClick={(e) => add(c, 1, e.currentTarget)} aria-label={`Додати в кошик: ${c.n}`}>
      <Icon name="bag" size={size === "lg" ? 20 : 17} />
      <span>{label}</span>
    </button>
  );
}

/** First photo; the second one (interior ↔ packshot) cross-fades in on hover. */
export function ProductImage({ c, eager }: { c: Card; eager?: boolean }) {
  if (!c.img)
    return (
      <span className="stage-empty" aria-hidden="true">
        <Icon name="flame" size={44} stroke={1} />
      </span>
    );
  return (
    <>
      <img src={img(c.id, true)} alt={c.n} loading={eager ? "eager" : "lazy"} decoding="async" className={`stage-a ${c.k === "w" ? "is-pack" : "is-photo"}`} />
      {c.img > 1 && <img src={img(c.id, true, 1)} alt="" aria-hidden="true" loading="lazy" decoding="async" className={`stage-b ${c.k2 === "w" ? "is-pack" : "is-photo"}`} />}
    </>
  );
}

export function Stock({ st, small }: { st: boolean; small?: boolean }) {
  return <span className={`stock ${st ? "is-in" : "is-order"} ${small ? "stock-sm" : ""}`}>{st ? "В наявності" : "Під замовлення"}</span>;
}

export function ProductCard({ c, eager }: { c: Card; eager?: boolean }) {
  const off = discount(c);
  return (
    <article className="pcard">
      <Link href={`/tovar/${c.s}`} className="pcard-link" data-cursor="Детальніше">
        <span className="stage">
          <ProductImage c={c} eager={eager} />
          <span className="badges">
            {off > 0 && <span className="badge badge-sale">−{off}%</span>}
            {c.hot && <span className="badge badge-hot">Хіт</span>}
          </span>
          {(c.d || c.w) && (
            <span className="stage-meta">
              {c.d && <span>{c.d} мм</span>}
              {c.w && <span>{c.w}</span>}
            </span>
          )}
        </span>
        <span className="pcard-body">
          <span className="pcard-top">
            {c.bn && <span className="pcard-brand">{c.bn}</span>}
            <Stock st={c.st} small />
          </span>
          <span className="pcard-name">{c.n}</span>
        </span>
      </Link>
      <div className="pcard-foot">
        <span className="pcard-price">
          {c.o && <s>{price(c.o)}</s>}
          <b className={c.o ? "is-sale" : ""}>{price(c.p)}</b>
        </span>
        <AddToCart c={c} />
      </div>
    </article>
  );
}
