import Link from "next/link";
import { type Brand, products } from "@/lib/catalog";
import { goods } from "@/lib/format";
import { Icon } from "../Icons";

/** Hand-picked interior per brand (product id-photo); others fall back to the brand's first interior shot. */
const ART: Record<string, string> = { irsap: "11292-1", vasco: "7970-0", stelrad: "8267-1", radson: "9358-1", purmo: "8928-1", mario: "8100-1", hybro: "9344-0" };

function artFor(id: string) {
  if (ART[id]) return ART[id];
  const p = products.find((x) => x.brand === id && x.imgs.length);
  if (!p) return null;
  const n = Math.max(0, p.imgs.findIndex((i) => i[0] === "p"));
  return `${p.id}-${n}`;
}

/** Brand wall: wordmark + origin; on hover a real interior from the brand fades up behind it. */
export function Brands({ brands, limit }: { brands: Brand[]; limit?: number }) {
  return (
    <div className="brands">
      {brands.slice(0, limit).map((b, i) => {
        const art = artFor(b.id);
        return (
          <Link key={b.id} href={`/brendy/${b.id}`} className="brand-card spot" data-reveal style={{ ["--d" as string]: `${(i % 4) * 0.07}s` }} data-cursor={b.name}>
            {art && <img className="brand-art" src={`/images/p/${art}.webp`} alt="" loading="lazy" aria-hidden="true" />}
            <span className="brand-origin">{b.country}</span>
            <span className="brand-name">{b.name}</span>
            <span className="brand-line">{b.line}</span>
            <span className="brand-count">
              {goods(b.count)} <Icon name="arrowUpRight" size={16} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
