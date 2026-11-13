/** Client-safe helpers (no catalogue import). */

export type Card = {
  id: number;
  s: string; // slug
  n: string; // name
  p: number; // price, ₴
  o: number | null; // old price (sale)
  b: string | null; // brand id
  bn: string | null; // brand name
  sec: string;
  sub: string | null;
  st: boolean; // in stock (otherwise «під замовлення»)
  d: string | null; // dimensions «H×W»
  w: string | null; // heat output / power
  col: string | null;
  con: string | null; // connection: Нижнє | Бічне
  cty: string | null; // country
  img: number; // number of photos
  k: "w" | "p" | null; // first photo: white packshot or interior
  k2: "w" | "p" | null; // second photo (hover)
  hot?: boolean;
};

export const money = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
export const price = (n: number) => (n ? `${money(n)} ₴` : "Ціна за запитом");
export const discount = (c: { p: number; o: number | null }) => (c.o && c.o > c.p ? Math.round((1 - c.p / c.o) * 100) : 0);

/** Photo n of a product; `small` = 640 px card version (exists for the first two). */
export const img = (id: number, small = false, n = 0) => `/images/p/${id}-${n}${small ? "s" : ""}.webp`;

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export const goods = (n: number) => `${n} ${plural(n, "товар", "товари", "товарів")}`;

/** Watts from «1243 Вт» / «1,2 кВт». */
export function watts(s: string | null | undefined) {
  if (!s) return 0;
  const m = s.replace(",", ".").match(/([\d.]+)\s*(к?)\s*[вw]/i);
  if (!m) return 0;
  return Math.round(parseFloat(m[1]) * (m[2] ? 1000 : 1));
}

/** Lower-cased, Latin/Cyrillic look-alikes folded, so «Тесі», «tesi», «ТЕСИ» and «1800х450» / «1800x450» match. */
export function fold(s: string) {
  return s
    .toLowerCase()
    .replace(/[ʼ’'`"«»]/g, "")
    .replace(/(\d)\s*[xх×*]\s*(\d)/g, "$1x$2")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const TRANSLIT: Record<string, string> = {
  ірсап: "irsap", ирсап: "irsap", зендер: "zehnder", цендер: "zehnder", васко: "vasco", стелрад: "stelrad", стельрад: "stelrad",
  квін: "quinn", пурмо: "purmo", радсон: "radson", терма: "terma", маріо: "mario", маріо_: "mario", тесі: "tesi", тези: "tesi", арпа: "arpa",
};

/** Every query word must appear in the haystack; earlier/brand hits rank higher. */
export function searchCards(cards: Card[], q: string, limit = 60) {
  const words = fold(q).split(" ").filter(Boolean).map((w) => TRANSLIT[w] ?? w);
  if (!words.length) return [];
  const out: { c: Card; score: number }[] = [];
  for (const c of cards) {
    const hay = fold(`${c.bn ?? ""} ${c.n} ${c.col ?? ""}`);
    let score = 0;
    let ok = true;
    for (const w of words) {
      const i = hay.indexOf(w);
      if (i < 0) {
        ok = false;
        break;
      }
      score += i === 0 || hay[i - 1] === " " ? 3 : 1;
      score -= i / 400;
    }
    if (ok) out.push({ c, score: score + (c.hot ? 0.5 : 0) + (c.st ? 0.3 : 0) });
  }
  return out
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}
