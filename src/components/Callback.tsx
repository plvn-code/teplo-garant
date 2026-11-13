"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { Icon } from "./Icons";

export const openCallback = (product?: string) => window.dispatchEvent(new CustomEvent("open-callback", { detail: { product } }));

export function CallbackButton({ product, className, children }: { product?: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => openCallback(product)}>
      {children}
    </button>
  );
}

/** Ukrainian mobile mask: +380 XX XXX XX XX. Accepts paste in any format. */
export function maskPhone(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("380")) d = d.slice(3);
  else if (d.startsWith("80")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 9);
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return d ? `+380 ${p.join(" ")}` : "";
}

export function CallbackForm({ product, topic, onDone }: { product?: string; topic?: boolean; onDone?: () => void }) {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    const res = await fetch("/api/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: f.get("name"), phone, product, topic: f.get("topic"), website: f.get("website") }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok) {
      setState("done");
      onDone?.();
    } else {
      setState("error");
      setError(data?.error ?? "Не вдалося надіслати.");
    }
  };

  if (state === "done")
    return (
      <div className="form-done">
        <span className="form-done-icon">
          <Icon name="check" size={28} />
        </span>
        <p>
          <b>Дякуємо!</b> Передзвонимо найближчим часом у робочі години ({site.hours}).
        </p>
      </div>
    );

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        <span>Ім’я</span>
        <input name="name" autoComplete="given-name" placeholder="Як до вас звертатися" maxLength={80} />
      </label>
      <label className="field">
        <span>Телефон *</span>
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+380 __ ___ __ __" required value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />
      </label>
      {topic && (
        <label className="field">
          <span>Питання</span>
          <input name="topic" placeholder="Напр.: який радіатор на кімнату 18 м²?" maxLength={200} />
        </label>
      )}
      <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {state === "error" && (
        <p className="form-error" role="alert">
          {error} Або зателефонуйте: <a href={site.phoneHref}>{site.phone}</a>
        </p>
      )}
      <button type="submit" className="btn btn-lg btn-block btn-glow" disabled={state === "sending"}>
        {state === "sending" ? "Надсилаємо…" : product ? "Замовити в один клік" : "Передзвоніть мені"}
      </button>
      <p className="form-note">Без спаму. Номер потрібен лише для зв’язку щодо замовлення.</p>
    </form>
  );
}

export function CallbackModal() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<string | undefined>();
  const [key, setKey] = useState(0);
  const pathname = usePathname();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setProduct((e as CustomEvent<{ product?: string }>).detail?.product);
      setKey((k) => k + 1);
      setOpen(true);
    };
    window.addEventListener("open-callback", onOpen);
    return () => window.removeEventListener("open-callback", onOpen);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => box.current?.querySelector<HTMLInputElement>("input[name=phone]")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`modal ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="cb-title" inert={!open}>
      <div className="modal-scrim" onClick={() => setOpen(false)} />
      <div className="modal-box" ref={box}>
        <button type="button" className="icon-btn modal-x" onClick={() => setOpen(false)} aria-label="Закрити">
          <Icon name="close" size={20} />
        </button>
        <p className="eyebrow">{product ? "Купити в один клік" : "Консультація"}</p>
        <h2 id="cb-title" className="modal-title">
          {product ? "Залиште номер — оформимо за вас" : "Підкажемо, що обрати"}
        </h2>
        {product && <p className="modal-product">{product}</p>}
        <CallbackForm key={key} product={product} topic={!product} />
      </div>
    </div>
  );
}
