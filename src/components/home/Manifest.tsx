"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/lib/motion";

const text =
  "З 2000 року ми робимо домівки теплими й красивими. Постачаємо радіатори IRSAP, Zehnder, Vasco і Stelrad напряму від виробників — без посередників, з гарантією до 10 років і доставкою по всій Україні.";
const accent = new Set(["теплими", "красивими.", "напряму", "10", "років"]);

/** Words warm up one by one (grey → white → red accent) while the section is pinned; a warm streak crosses the panel. */
export function Manifest() {
  const root = useRef<HTMLElement>(null);
  const words = text.split(" ");
  useScrollProgress(root, (p) => {
    const el = root.current;
    if (!el) return;
    el.style.setProperty("--p", p.toFixed(3));
    const lit = Math.round(p * 1.3 * words.length);
    el.querySelectorAll<HTMLElement>(".mw").forEach((w, i) => w.classList.toggle("is-lit", i < lit));
  });
  return (
    <section className="manifest" ref={root}>
      <div className="manifest-sticky">
        <div className="manifest-streak" aria-hidden="true" />
        <div className="manifest-thermo" aria-hidden="true">
          <span />
        </div>
        <div className="container manifest-inner">
          <p className="eyebrow">Про Тепло Гарант</p>
          <p className="manifest-text">
            {words.map((w, i) => (
              <span key={i} className={`mw ${accent.has(w) ? "is-accent" : ""}`}>
                {w}{" "}
              </span>
            ))}
          </p>
          <div className="manifest-facts">
            <span>Офіційний дистриб’ютор Stelrad</span>
            <span>Склад під Львовом</span>
            <span>Шоуруми в Києві та Івано-Франківську</span>
            <span>Власний автопарк</span>
          </div>
        </div>
      </div>
    </section>
  );
}
