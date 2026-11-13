"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { goods, img, price } from "@/lib/format";
import { Icon } from "./Icons";

export function CartLines({ compact }: { compact?: boolean }) {
  const { lines, setQty, remove } = useCart();
  return (
    <ul className={`cart-lines ${compact ? "is-compact" : ""}`}>
      {lines.map((l) => (
        <li key={l.id} className="cart-line">
          <Link href={`/tovar/${l.s}`} className="cart-line-img">
            <img src={img(l.id, true)} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
          </Link>
          <div className="cart-line-body">
            <Link href={`/tovar/${l.s}`} className="cart-line-name">
              {l.bn && <small>{l.bn}</small>}
              {l.n}
            </Link>
            <div className="cart-line-row">
              <div className="stepper stepper-sm" role="group" aria-label="Кількість">
                <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label="Менше">
                  <Icon name="minus" size={14} />
                </button>
                <output>{l.qty}</output>
                <button type="button" onClick={() => setQty(l.id, l.qty + 1)} aria-label="Більше">
                  <Icon name="plus" size={14} />
                </button>
              </div>
              <span className="cart-line-price">{price(l.p * l.qty)}</span>
            </div>
          </div>
          <button type="button" className="icon-btn cart-line-x" onClick={() => remove(l.id)} aria-label={`Видалити: ${l.n}`}>
            <Icon name="close" size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function CartDrawer() {
  const { open, setOpen, lines, count, total, toast } = useCart();
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <div className={`drawer ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Кошик" inert={!open}>
        <div className="drawer-scrim" onClick={() => setOpen(false)} />
        <aside className="drawer-panel">
          <div className="drawer-head">
            <h2>
              Кошик <small>{count ? goods(count) : ""}</small>
            </h2>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Закрити кошик">
              <Icon name="close" size={20} />
            </button>
          </div>
          {lines.length ? (
            <>
              <div className="drawer-body">
                <CartLines compact />
              </div>
              <div className="drawer-foot">
                <div className="drawer-total">
                  <span>Разом</span>
                  <b>{price(total)}</b>
                </div>
                <p className="drawer-note">
                  <Icon name="truck" size={16} /> Доставка по Україні 1–3 дні або самовивіз під Львовом
                </p>
                <Link href="/koshyk" className="btn btn-lg btn-block btn-glow">
                  Оформити замовлення <Icon name="arrow" size={18} />
                </Link>
                <button type="button" className="btn btn-ghost btn-block" onClick={() => setOpen(false)}>
                  Продовжити покупки
                </button>
              </div>
            </>
          ) : (
            <div className="drawer-empty">
              <span className="drawer-empty-icon">
                <Icon name="bag" size={34} stroke={1.2} />
              </span>
              <p>Кошик поки порожній</p>
              <Link href="/katalog" className="btn">
                До каталогу <Icon name="arrow" size={18} />
              </Link>
            </div>
          )}
        </aside>
      </div>

      <div className={`toast ${toast ? "is-on" : ""}`} role="status" aria-live="polite">
        {toast && (
          <div className="toast-inner" key={toast.key}>
            <img src={img(toast.id, true)} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
            <div>
              <b>Додано в кошик</b>
              <span>{toast.name}</span>
            </div>
            <button type="button" className="btn btn-sm" onClick={() => setOpen(true)}>
              Відкрити
            </button>
          </div>
        )}
      </div>
    </>
  );
}
