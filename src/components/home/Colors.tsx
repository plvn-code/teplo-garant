"use client";

import Link from "next/link";
import { useState } from "react";
import { openCallback } from "../Callback";
import { Icon } from "../Icons";

export type Finish = { label: string; tint: string; src: string; s: string; n: string };

/** «Будь-який колір»: swatches swap a real interior shot of that finish; the glow takes the colour. */
export function Colors({ finishes }: { finishes: Finish[] }) {
  const [i, setI] = useState(0);
  const cur = finishes[i];
  return (
    <div className="colors" style={{ ["--tint" as string]: cur.tint }}>
      <div className="colors-copy">
        <p className="eyebrow" data-reveal>
          Дизайнерське фарбування
        </p>
        <h2 className="display-md" data-reveal>
          Радіатор у колір <em>вашого інтер’єру</em>
        </h2>
        <p className="section-lead" data-reveal>
          Білий, графіт, матовий чорний, мідь, золото чи будь-який відтінок RAL — дизайнерські моделі постачаються в десятках фарбувань, а ще ми пропонуємо професійне дизайнерське фарбування радіаторів.
        </p>
        <div className="swatches" role="tablist" aria-label="Фарбування" data-reveal>
          {finishes.map((f, n) => (
            <button key={f.label} type="button" role="tab" aria-selected={n === i} className={`sw ${n === i ? "is-on" : ""}`} onClick={() => setI(n)} onMouseEnter={() => setI(n)}>
              <i style={{ background: f.tint }} aria-hidden="true" />
              <span>{f.label}</span>
            </button>
          ))}
        </div>
        <div className="band-actions" data-reveal>
          <button type="button" className="btn btn-lg btn-glow" onClick={() => openCallback("Дизайнерське фарбування радіатора")}>
            Обговорити колір <Icon name="palette" size={18} />
          </button>
          <Link href="/katalog/dyzainerski-radiatory" className="btn btn-lg btn-outline">
            Дизайн-радіатори
          </Link>
        </div>
      </div>
      <div className="colors-stage" data-reveal>
        <div className="colors-glow" aria-hidden="true" />
        {finishes.map((f, n) => (
          <img key={f.src} src={f.src} alt={n === i ? f.n : ""} aria-hidden={n !== i} className={`colors-img ${n === i ? "is-on" : ""}`} loading="lazy" />
        ))}
        <Link href={`/tovar/${cur.s}`} className="colors-tag" key={cur.s}>
          <small>{cur.label}</small>
          {cur.n} <Icon name="arrowUpRight" size={16} />
        </Link>
      </div>
    </div>
  );
}
