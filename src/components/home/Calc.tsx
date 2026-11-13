"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Card, money, watts } from "@/lib/format";
import { openCallback } from "../Callback";
import { Icon } from "../Icons";
import { ProductCard } from "../ProductCard";

const ROOMS = [
  { id: "room", label: "Кімната", k: 1 },
  { id: "corner", label: "Кутова кімната", k: 1.2 },
  { id: "kitchen", label: "Кухня", k: 0.9 },
  { id: "bath", label: "Ванна", k: 1.1 },
];
const WALLS = [
  { id: "good", label: "Утеплений будинок", k: 0.8 },
  { id: "mid", label: "Звичайні стіни", k: 1 },
  { id: "poor", label: "Холодні стіни", k: 1.25 },
];
const WINDOWS = [
  { id: "1", label: "1 вікно", k: 1 },
  { id: "2", label: "2 вікна", k: 1.1 },
  { id: "pano", label: "Панорамні", k: 1.3 },
];

/**
 * Rough heat-loss estimate: 41 W per m³ (the common rule of thumb for Ukrainian housing) × room, walls and glazing factors.
 * Shows the needed output and radiators whose catalogue output covers it with a sensible margin. Clearly marked as an estimate.
 */
export function Calc({ cards, compact }: { cards: Card[]; compact?: boolean }) {
  const [area, setArea] = useState(18);
  const [height, setHeight] = useState(2.7);
  const [room, setRoom] = useState("room");
  const [wall, setWall] = useState("mid");
  const [win, setWin] = useState("1");

  const need = useMemo(() => {
    const k = (ROOMS.find((r) => r.id === room)?.k ?? 1) * (WALLS.find((r) => r.id === wall)?.k ?? 1) * (WINDOWS.find((r) => r.id === win)?.k ?? 1);
    return Math.round((area * height * 41 * k) / 10) * 10;
  }, [area, height, room, wall, win]);

  const picks = useMemo(() => {
    const pool = cards.filter((c) => (room === "bath" ? c.sec.includes("rushnykosushky") || c.sec.includes("radiatory") : c.sec.includes("radiatory")));
    return pool
      .map((c) => ({ c, w: watts(c.w) }))
      .filter((x) => x.w >= need * 0.95 && x.w <= need * 1.6)
      .sort((a, b) => Number(!!b.c.o) - Number(!!a.c.o) || Number(b.c.st) - Number(a.c.st) || a.w - b.w)
      .slice(0, compact ? 4 : 8)
      .map((x) => x.c);
  }, [cards, need, room, compact]);

  const two = Math.ceil(need / 2 / 10) * 10;
  const temp = Math.min(1, need / 6000);

  return (
    <div className={`calc ${compact ? "calc-compact" : ""}`}>
      <div className="calc-panel">
        <div className="calc-field">
          <div className="calc-label">
            <span>Площа приміщення</span>
            <output>
              {area} <small>м²</small>
            </output>
          </div>
          <input type="range" min={4} max={80} step={1} value={area} onChange={(e) => setArea(Number(e.target.value))} aria-label="Площа приміщення, м²" style={{ ["--v" as string]: (area - 4) / 76 }} />
        </div>
        <div className="calc-field">
          <div className="calc-label">
            <span>Висота стелі</span>
            <output>
              {height.toFixed(1).replace(".", ",")} <small>м</small>
            </output>
          </div>
          <input type="range" min={2.4} max={4.5} step={0.1} value={height} onChange={(e) => setHeight(Number(e.target.value))} aria-label="Висота стелі, м" style={{ ["--v" as string]: (height - 2.4) / 2.1 }} />
        </div>
        <div className="calc-field">
          <span className="calc-label">Приміщення</span>
          <div className="chips">
            {ROOMS.map((r) => (
              <button key={r.id} type="button" className={`chip chip-sm ${room === r.id ? "is-on" : ""}`} onClick={() => setRoom(r.id)} aria-pressed={room === r.id}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="calc-field">
          <span className="calc-label">Стіни</span>
          <div className="chips">
            {WALLS.map((r) => (
              <button key={r.id} type="button" className={`chip chip-sm ${wall === r.id ? "is-on" : ""}`} onClick={() => setWall(r.id)} aria-pressed={wall === r.id}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="calc-field">
          <span className="calc-label">Вікна</span>
          <div className="chips">
            {WINDOWS.map((r) => (
              <button key={r.id} type="button" className={`chip chip-sm ${win === r.id ? "is-on" : ""}`} onClick={() => setWin(r.id)} aria-pressed={win === r.id}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="calc-result" style={{ ["--t" as string]: temp }}>
        <div className="calc-meter" aria-hidden="true">
          <span />
        </div>
        <p className="eyebrow">Потрібна тепловіддача</p>
        <p className="calc-need" aria-live="polite">
          ≈ {money(need)} <small>Вт</small>
        </p>
        <p className="calc-split">
          Один прилад на {(need / 1000).toFixed(1).replace(".", ",")} кВт або два по {money(two)} Вт — наприклад, під кожне вікно.
        </p>
        <p className="calc-note">Орієнтовний розрахунок. Точний підбір з урахуванням температурного режиму системи зробить наш інженер — безкоштовно.</p>
        <div className="calc-actions">
          <button type="button" className="btn btn-glow" onClick={() => openCallback(`Підбір радіатора: ${area} м², ${height} м, ≈ ${need} Вт`)}>
            Точний розрахунок <Icon name="arrow" size={18} />
          </button>
          {compact && (
            <Link href="/pidbir" className="btn btn-outline">
              Усі варіанти
            </Link>
          )}
        </div>
      </div>

      <div className="calc-picks">
        <p className="calc-picks-h">
          {picks.length ? (
            <>
              <b>Підходять за потужністю</b> · від {money(need)} Вт
            </>
          ) : (
            <>Для такої потужності краще два прилади — спитайте інженера, підберемо комплект.</>
          )}
        </p>
        <div className={compact ? "grid calc-grid" : "grid"}>
          {picks.map((c) => (
            <div className="grid-cell" key={c.id}>
              <ProductCard c={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
