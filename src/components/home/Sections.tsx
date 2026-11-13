import Link from "next/link";
import type { Section } from "@/lib/catalog";
import { goods } from "@/lib/format";
import { Icon } from "../Icons";

/** Bento of the catalogue sections, each on a real interior shot that slowly zooms on hover. */
const TILES: { id: string; art: string; size?: "xl" | "wide"; pos?: string }[] = [
  { id: "dyzainerski-radiatory", art: "9957-3", size: "xl", pos: "50% 30%" },
  { id: "dyzainerski-rushnykosushky", art: "12655-3", size: "wide", pos: "50% 45%" },
  { id: "stalevi-radiatory", art: "8461-1" },
  { id: "elektrychni-radiatory", art: "12675-0" },
  { id: "vodiani-rushnykosushky", art: "8100-1" },
  { id: "elektrychni-rushnykosushky", art: "9337-0" },
  { id: "krany", art: "9321-2" },
  { id: "teny", art: "9729-0" },
];

export function Sections({ sections }: { sections: Section[] }) {
  return (
    <div className="bento">
      {TILES.map((t, i) => {
        const s = sections.find((x) => x.id === t.id);
        if (!s) return null;
        return (
          <Link key={t.id} href={`/katalog/${s.id}`} className={`tile ${t.size ? `tile-${t.size}` : ""}`} data-reveal style={{ ["--d" as string]: `${i * 0.06}s` }} data-cursor="Відкрити">
            <img className="tile-img" src={`/images/p/${t.art}${t.size ? "" : ""}.webp`} alt="" loading="lazy" aria-hidden="true" style={t.pos ? { objectPosition: t.pos } : undefined} />
            <span className="tile-text">
              <small>{goods(s.count)}</small>
              <b>{s.name}</b>
              {t.size && <span className="tile-lead">{s.lead}</span>}
            </span>
            <span className="tile-go">
              <Icon name="arrowUpRight" size={20} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
