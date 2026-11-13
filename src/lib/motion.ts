"use client";

import { type RefObject, useEffect } from "react";

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * Calls `onProgress` with how far the page has scrolled through `ref`:
 * "pin" → 0 when the element's top reaches the viewport top, 1 when its bottom reaches the viewport bottom;
 * "through" → 0 when its top enters from below, 1 when its bottom leaves above.
 * Only runs while the element is near the viewport.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  mode: "pin" | "through" = "pin",
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let visible = true;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = mode === "pin" ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (r.height + vh);
      onProgress(clamp(p));
    };
    const request = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) request();
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(el);
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
    // onProgress is stable per mount: every caller writes to refs/CSS variables only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, mode]);
}
