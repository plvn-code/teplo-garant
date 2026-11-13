"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Card } from "@/lib/format";
import { reducedMotion } from "@/lib/motion";
import { Icon } from "../Icons";
import { ProductCard } from "../ProductCard";

/**
 * Pinned horizontal rail: while the section is on screen, vertical scrolling slides the cards sideways.
 * Touch screens, narrow viewports and reduced motion get a plain swipeable row instead.
 */
export function Rail({ cards, eyebrow, title, href, more }: { cards: Card[]; eyebrow: string; title: React.ReactNode; href: string; more: string }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mq = window.matchMedia("(min-width: 900px) and (hover: hover)");
    let raf = 0;
    let dist = 0;
    const update = () => {
      raf = 0;
      if (!dist) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      tr.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      el.style.setProperty("--p", p.toFixed(3));
    };
    const measure = () => {
      if (!mq.matches || reducedMotion()) {
        el.style.height = "";
        tr.style.transform = "";
        el.classList.remove("is-pinned");
        dist = 0;
        return;
      }
      el.classList.add("is-pinned");
      dist = Math.max(0, tr.scrollWidth - window.innerWidth + 80);
      el.style.height = `${window.innerHeight + dist}px`;
      update();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", measure);
    };
  }, []);

  return (
    <section className="rail" ref={root}>
      <div className="rail-sticky">
        <div className="container rail-head">
          <div>
            <p className="eyebrow" data-reveal>
              {eyebrow}
            </p>
            <h2 className="display-md" data-reveal>
              {title}
            </h2>
          </div>
          <Link href={href} className="link-arrow" data-reveal>
            {more} <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="rail-viewport">
          <div className="rail-track" ref={track}>
            {cards.map((c, i) => (
              <div className="rail-item" key={c.id}>
                <ProductCard c={c} eager={i < 3} />
              </div>
            ))}
            <Link href={href} className="rail-more" data-cursor="Каталог">
              <Icon name="grid" size={30} stroke={1.3} />
              <span>{more}</span>
              <Icon name="arrow" size={26} />
            </Link>
          </div>
        </div>
        <div className="container rail-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
