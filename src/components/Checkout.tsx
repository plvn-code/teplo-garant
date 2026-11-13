"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { goods, price } from "@/lib/format";
import { delivery, payment, site } from "@/lib/site";
import { maskPhone } from "./Callback";
import { CartLines } from "./CartDrawer";
import { Icon } from "./Icons";

type Done = { number: string; total: number; name: string };

export function Checkout() {
  const { lines, total, count, clear, ready } = useCart();
  const [ship, setShip] = useState<string>("np");
  const [pay, setPay] = useState<string>("cod");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError(null);
    const body = {
      name: f.get("name"), phone, delivery: ship, payment: pay,
      city: f.get("city"), branch: f.get("branch"), address: f.get("address"), comment: f.get("comment"),
      noCall: f.get("noCall") === "on", website: f.get("website"),
      items: lines.map((l) => ({ id: l.id, qty: l.qty })),
    };
    const res = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.ok) {
      setDone({ number: data.number, total: data.total, name: String(body.name ?? "") });
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setState("error");
      setError({ text: data?.error ?? "Не вдалося надіслати замовлення.", field: data?.field });
    }
  };

  if (done)
    return (
      <div className="order-done" data-reveal>
        <span className="order-done-icon">
          <Icon name="check" size={40} stroke={2} />
        </span>
        <p className="eyebrow">Замовлення {done.number}</p>
        <h2 className="display-md">Дякуємо{done.name ? `, ${done.name}` : ""}!</h2>
        <p className="section-lead">
          Ми отримали замовлення на {price(done.total)}. Менеджер зв’яжеться з вами найближчим часом ({site.hours}), щоб підтвердити наявність і доставку.
        </p>
        <div className="band-actions">
          <Link href="/katalog" className="btn btn-lg btn-glow">
            Повернутися до каталогу
          </Link>
          <a href={site.phoneHref} className="btn btn-lg btn-outline">
            <Icon name="phone" size={18} /> {site.phone}
          </a>
        </div>
      </div>
    );

  if (!ready) return <div className="grid-skeleton" />;

  if (!lines.length)
    return (
      <div className="drawer-empty checkout-empty">
        <span className="drawer-empty-icon">
          <Icon name="bag" size={40} stroke={1.2} />
        </span>
        <p>Кошик порожній. Додайте товари з каталогу — і повертайтеся сюди.</p>
        <Link href="/katalog" className="btn btn-lg btn-glow">
          До каталогу <Icon name="arrow" size={18} />
        </Link>
      </div>
    );

  const bad = (f: string) => (error?.field === f ? "is-bad" : "");

  return (
    <form className="checkout" onSubmit={submit} noValidate>
      <div className="checkout-main">
        <fieldset className="co-step">
          <legend>
            <span>1</span> Контакти
          </legend>
          <div className="co-fields">
            <label className={`field ${bad("name")}`}>
              <span>Ім’я та прізвище *</span>
              <input name="name" autoComplete="name" required maxLength={80} placeholder="Іван Петренко" />
            </label>
            <label className={`field ${bad("phone")}`}>
              <span>Телефон *</span>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+380 __ ___ __ __" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />
            </label>
          </div>
        </fieldset>

        <fieldset className="co-step">
          <legend>
            <span>2</span> Доставка
          </legend>
          <div className="co-options">
            {delivery.map((d) => (
              <label key={d.id} className={`option ${ship === d.id ? "is-on" : ""}`}>
                <input type="radio" name="delivery" value={d.id} checked={ship === d.id} onChange={() => setShip(d.id)} />
                <span className="option-dot" aria-hidden="true" />
                <span>
                  <b>{d.title}</b>
                  <small>{d.note}</small>
                </span>
              </label>
            ))}
          </div>
          {ship === "np" && (
            <div className="co-fields co-reveal">
              <label className={`field ${bad("city")}`}>
                <span>Місто *</span>
                <input name="city" autoComplete="address-level2" placeholder="Напр.: Київ" maxLength={80} />
              </label>
              <label className={`field ${bad("city")}`}>
                <span>Перевізник і відділення *</span>
                <input name="branch" placeholder="Напр.: Нова пошта, вантажне № 12" maxLength={120} />
              </label>
            </div>
          )}
          {ship === "courier" && (
            <div className="co-fields co-reveal">
              <label className={`field field-wide ${bad("address")}`}>
                <span>Адреса у Львові *</span>
                <input name="address" autoComplete="street-address" placeholder="Вулиця, будинок, квартира" maxLength={160} />
              </label>
            </div>
          )}
        </fieldset>

        <fieldset className="co-step">
          <legend>
            <span>3</span> Оплата
          </legend>
          <div className="co-options co-options-2">
            {payment.map((d) => (
              <label key={d.id} className={`option ${pay === d.id ? "is-on" : ""}`}>
                <input type="radio" name="payment" value={d.id} checked={pay === d.id} onChange={() => setPay(d.id)} />
                <span className="option-dot" aria-hidden="true" />
                <span>
                  <b>{d.title}</b>
                  <small>{d.note}</small>
                </span>
              </label>
            ))}
          </div>
          <label className="field field-wide">
            <span>Коментар до замовлення</span>
            <textarea name="comment" rows={3} maxLength={600} placeholder="Зручний час для дзвінка, потрібна сторона підключення, колір RAL…" />
          </label>
          <label className="check check-line">
            <input type="checkbox" name="noCall" />
            <span className="check-box" aria-hidden="true">
              <Icon name="check" size={13} stroke={2.4} />
            </span>
            Можна не телефонувати — підтвердіть у месенджері
          </label>
          <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        </fieldset>
      </div>

      <aside className="checkout-side">
        <div className="co-summary">
          <div className="co-summary-head">
            <b>Ваше замовлення</b>
            <span>{goods(count)}</span>
          </div>
          <CartLines compact />
          <div className="co-total">
            <span>До сплати</span>
            <b>{price(total)}</b>
          </div>
          <p className="co-note">Доставка — за тарифами перевізника. Менеджер підтвердить наявність, терміни й остаточну суму.</p>
          {error && (
            <p className="form-error" role="alert">
              {error.text}
            </p>
          )}
          <button type="submit" className="btn btn-lg btn-block btn-glow" disabled={state === "sending"}>
            {state === "sending" ? "Надсилаємо…" : "Підтвердити замовлення"}
          </button>
          <p className="co-note">Натискаючи кнопку, ви погоджуєтеся на обробку контактних даних для виконання замовлення.</p>
        </div>
      </aside>
    </form>
  );
}
