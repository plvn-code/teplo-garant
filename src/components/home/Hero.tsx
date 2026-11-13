"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { price } from "@/lib/format";
import { reducedMotion, useScrollProgress } from "@/lib/motion";
import { openSearch } from "../Header";
import { Icon } from "../Icons";

export type Slide = { src: string; s: string; n: string; brand: string; p: number; o: number | null; label: string; tint: string; sw: string };

const lines: { w: string; em?: boolean }[][] = [[{ w: "Тепло," }, { w: "яке" }], [{ w: "стає" }, { w: "інтер’єром", em: true }]];
const chips = [
  { href: "/katalog/dyzainerski-radiatory?sub=vertykalni", label: "Вертикальні" },
  { href: "/katalog/dyzainerski-rushnykosushky", label: "Рушникосушки" },
  { href: "/katalog/stalevi-radiatory", label: "Сталеві 22 тип" },
  { href: "/akcii", label: "Знижки до −80%" },
];
const DUR = 5200;

/**
 * Split hero: copy + search on the left, a tall showcase of real interior shots on the right.
 * Slides cross-fade with a slow Ken Burns; the glow behind the frame takes the colour of the current finish.
 * Scrolling pushes the copy up and tilts the frame back.
 */
export function Hero({ slides, total, years }: { slides: Slide[]; total: number; years: number }) {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useScrollProgress(root, (p) => root.current?.style.setProperty("--p", p.toFixed(3)));

  useEffect(() => {
    if (paused || reducedMotion()) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % slides.length), DUR);
    return () => window.clearTimeout(t);
  }, [i, paused, slides.length]);

  const cur = slides[i];
  let w = 0;
  return (
    <section className="hero" ref={root} style={{ ["--tint" as string]: cur.tint }}>
      <div className="hero-sticky">
        <div className="hero-bg" aria-hidden="true">
          <span className="hero-cold" />
          <span className="hero-warm" />
          <span className="hero-grid" />
        </div>

        <div className="container hero-layout">
          <div className="hero-content">
            <p className="hero-badge fade-up" style={{ animationDelay: "var(--intro-d, 0s)" }}>
              <span className="dot" /> Офіційний дистриб’ютор · Львів · доставка по Україні
            </p>
            <h1 className="hero-title">
              {lines.map((line, li) => (
                <span className="hero-line" key={li}>
                  {line.map((x) => (
                    <span className={`word ${x.em ? "is-em" : ""}`} key={x.w}>
                      <span style={{ ["--d" as string]: `${0.05 + w++ * 0.09}s` }}>{x.w}</span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <div className="hero-left fade-up" style={{ animationDelay: "calc(var(--intro-d, 0s) + .45s)" }}>
              <p className="hero-lead">
                Дизайнерські й сталеві радіатори, рушникосушки та комплектуючі IRSAP, Zehnder, Vasco і Stelrad. Підберемо потужність, колір і підключення — і привеземо за 1–3 дні.
              </p>
              <button type="button" className="hero-search" onClick={() => openSearch()} data-cursor="Пошук">
                <Icon name="search" size={22} />
                <span>Модель, розмір або колір: «Tesi 1800», «чорний», «22 тип»</span>
                <span className="hero-search-go">
                  <Icon name="arrow" size={20} />
                </span>
              </button>
              <div className="hero-chips">
                {chips.map((c) => (
                  <Link key={c.href} href={c.href} className="chip chip-glass">
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hero-stats fade-up" style={{ animationDelay: "calc(var(--intro-d, 0s) + .6s)" }}>
              <div>
                <b data-count={years}>{years}</b>
                <span>років на ринку тепла</span>
              </div>
              <div>
                <b data-count={total}>{total}</b>
                <span>моделей у каталозі</span>
              </div>
              <div>
                <b>
                  10<small>років</small>
                </b>
                <span>гарантії на радіатори</span>
              </div>
            </div>
          </div>

          <div className="hero-show fade-up" style={{ animationDelay: "calc(var(--intro-d, 0s) + .25s)" }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="hero-glow" aria-hidden="true" />
            <div className="hero-frame">
              {slides.map((s, n) => (
                <img key={s.src} src={s.src} alt={n === i ? s.n : ""} aria-hidden={n !== i} className={`hero-slide ${n === i ? "is-on" : ""}`} fetchPriority={n === 0 ? "high" : undefined} loading={n === 0 ? "eager" : "lazy"} />
              ))}
              <span className="hero-frame-shade" aria-hidden="true" />
              <span className="hero-finish" key={cur.label}>
                <i style={{ background: cur.sw }} aria-hidden="true" />
                {cur.label}
              </span>
              <Link href={`/tovar/${cur.s}`} className="hero-card" key={cur.s} data-cursor="До моделі">
                <span className="hero-card-text">
                  <small>{cur.brand}</small>
                  <b>{cur.n}</b>
                </span>
                <span className="hero-card-price">
                  {cur.o && <s>{price(cur.o)}</s>}
                  {price(cur.p)}
                </span>
                <span className="hero-card-go">
                  <Icon name="arrowUpRight" size={18} />
                </span>
              </Link>
            </div>
            <div className="hero-dots" role="tablist" aria-label="Інтер’єри">
              {slides.map((s, n) => (
                <button key={s.src} type="button" role="tab" aria-selected={n === i} aria-label={s.label} className={n === i ? "is-on" : ""} onClick={() => setI(n)} style={{ ["--dur" as string]: `${DUR}ms` }}>
                  <span className={paused ? "is-paused" : ""} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <a href="#rozdily" className="hero-scroll" aria-label="Прокрутити вниз">
          <i />
        </a>
      </div>
    </section>
  );
}
