"use client";

import { useEffect, useRef } from "react";

/**
 * A small pill that follows the mouse over [data-cursor] areas and says what a click does.
 * Mouse only: touch screens and reduced-motion users never see it.
 */
export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let shown = false;
    const tick = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as Element | null;
      // Real buttons and chips inside a card keep their own hover state.
      const zone = t?.closest?.(".chip, .btn") ? null : t?.closest?.<HTMLElement>("[data-cursor]");
      if (zone) {
        if (!shown) {
          cx = x;
          cy = y;
        }
        el.firstElementChild!.textContent = zone.dataset.cursor ?? "";
      }
      shown = Boolean(zone);
      el.classList.toggle("is-on", shown);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const hide = () => {
      shown = false;
      el.classList.remove("is-on");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("scroll", hide, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("scroll", hide);
    };
  }, []);

  return (
    <div ref={ref} className="cursor-label" aria-hidden="true">
      <span />
    </div>
  );
}
