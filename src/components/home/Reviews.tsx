import Link from "next/link";

type R = { n: string; d: string | null; t: string; r: number; product: string; slug: string };

/** Two rows of real customer reviews drifting in opposite directions; hover pauses. */
export function Reviews({ reviews }: { reviews: R[] }) {
  const half = Math.ceil(reviews.length / 2);
  const rows = [reviews.slice(0, half), reviews.slice(half)];
  return (
    <div className="rv">
      {rows.map((row, ri) => (
        <div className={`rv-row ${ri ? "is-rev" : ""}`} key={ri}>
          <div className="rv-track">
            {[0, 1].map((copy) =>
              row.map((r, i) => (
                <figure className="rv-card" key={`${copy}-${i}`} aria-hidden={copy ? true : undefined}>
                  <span className="stars" style={{ ["--r" as string]: r.r }} aria-label={`${r.r} з 5`} />
                  <blockquote>{r.t.length > 260 ? r.t.slice(0, 250).replace(/\s+\S*$/, "") + "…" : r.t}</blockquote>
                  <figcaption>
                    <span className="review-ava" aria-hidden="true">
                      {r.n.slice(0, 1)}
                    </span>
                    <span>
                      <b>{r.n}</b>
                      <Link href={`/tovar/${r.slug}`} tabIndex={copy ? -1 : undefined}>
                        {r.product}
                      </Link>
                    </span>
                  </figcaption>
                </figure>
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
