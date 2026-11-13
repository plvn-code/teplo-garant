"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

/**
 * Site-wide motion helpers, mounted once in the layout:
 * - [data-reveal] elements animate in when they enter the viewport (.is-in);
 * - [data-count] numbers count up on first sight (the final value is in the HTML, so nothing is lost without JS);
 * - [data-parallax="0.1"] elements drift with the scroll;
 * - .spot elements get --mx/--my for the cursor glow;
 * - --scroll on <html> drives the top progress line.
 */
export function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const count = (el: HTMLElement) => {
      const end = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? "";
      if (reduce || !end) return;
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / 1500);
        el.textContent = fmt(end * (1 - Math.pow(1 - k, 4))) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
          if ((e.target as HTMLElement).dataset.count) count(e.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.is-in), [data-count]:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      doc.style.setProperty("--scroll", String(window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight)));
      if (reduce) return;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = Number(el.dataset.parallax);
        el.style.setProperty("--py", `${((r.top + r.height / 2 - vh / 2) * speed).toFixed(1)}px`);
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".spot");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, [pathname]);

  return null;
}
