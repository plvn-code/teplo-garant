import Link from "next/link";
import { CallbackButton } from "@/components/Callback";
import { Brands } from "@/components/home/Brands";
import { Calc } from "@/components/home/Calc";
import { Colors, type Finish } from "@/components/home/Colors";
import { Hero, type Slide } from "@/components/home/Hero";
import { Manifest } from "@/components/home/Manifest";
import { Rail } from "@/components/home/Rail";
import { Reviews } from "@/components/home/Reviews";
import { Sections } from "@/components/home/Sections";
import { Icon, type IconName } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { Marquee, SectionHead } from "@/components/Shared";
import { allCards, allReviews, brands, getById, posts, products, reviewCount, saleCards, sections, toCard } from "@/lib/catalog";
import { site, showrooms } from "@/lib/site";

/** [product id, photo index, finish label, glow tint, finish swatch] */
const SLIDES: [number, number, string, string, string][] = [
  [9957, 3, "Чорний графіт", "#5a66c9", "#2b2d33"],
  [12675, 0, "Антрацит", "#c8433c", "#45474e"],
  [7926, 0, "Білий", "#3b5bd6", "#f2f2ef"],
  [12655, 3, "Золото", "#d6a94a", "linear-gradient(135deg,#f3dd9a,#b8913f 50%,#f1d690)"],
  [7970, 0, "Білий", "#e2552b", "#f2f2ef"],
];
const FINISHES: [number, number, string, string][] = [
  [11433, 3, "Білий", "#f2f2ef"],
  [9957, 3, "Графіт", "#3c3f47"],
  [11292, 1, "Мідь", "#b0603d"],
  [12655, 3, "Золото", "#d4ab55"],
  [10126, 3, "М’ята", "#a9dccb"],
  [11433, 1, "Синій", "#5d7fc4"],
];
const POPULAR = [9296, 8036, 8037, 12663, 9348, 9344];

export default function Home() {
  const slide = ([id, n, label, tint, sw]: (typeof SLIDES)[number]): Slide | null => {
    const p = getById(id);
    return p ? { src: `/images/p/${id}-${n}.webp`, s: p.slug, n: p.name, brand: brands.find((b) => b.id === p.brand)?.name ?? "", p: p.price, o: p.old, label, tint, sw } : null;
  };
  const slides = SLIDES.map(slide).filter((s): s is Slide => Boolean(s));
  const finishes = FINISHES.map(([id, n, label, tint]) => {
    const p = getById(id);
    return p ? { src: `/images/p/${id}-${n}.webp`, s: p.slug, n: p.name, label, tint } : null;
  }).filter((f): f is Finish => Boolean(f));
  const sale = saleCards().slice(0, 12);
  const calcCards = allCards().filter((c) => c.w);
  const popular = [
    ...POPULAR.map((id) => getById(id)).filter((p) => p !== undefined),
    ...products.filter((p) => p.popular || p.reviews.length >= 4),
  ]
    .filter((p, i, a) => a.findIndex((q) => q.id === p.id) === i && p.imgs.length > 1 && /radiatory|rushnykosushky/.test(p.section))
    .slice(0, 8)
    .map(toCard);
  const reviews = allReviews().slice(0, 14);

  return (
    <>
      <Hero slides={slides} total={products.length} years={new Date().getFullYear() - site.since} />

      <Marquee className="marquee-brands" items={["IRSAP", "ZEHNDER", "VASCO", "STELRAD", "RADSON", "QUINN", "PURMO", "TERMA", "THERMIC", "VARIO TERM", "MARIO"]} />

      <section className="section" id="rozdily">
        <div className="container">
          <SectionHead eyebrow="Каталог" title={<>Від радіатора — <em>до крана</em></>} lead="Усе для опалення й ванної в одному місці: прилади, рушникосушки, ТЕНи, крани та термоголовки, які підходять один до одного." link={{ href: "/katalog", label: "Весь каталог" }} />
          <Sections sections={sections} />
        </div>
      </section>

      <Manifest />

      <Rail cards={sale} eyebrow="Обмежена кількість" title={<>Акції <em>тижня</em></>} href="/akcii" more="Усі акції" />

      <section className="section section-calc" id="pidbir">
        <div className="container">
          <SectionHead eyebrow="Підбір за 30 секунд" title={<>Скільки тепла <em>потрібно кімнаті?</em></>} lead="Вкажіть площу й висоту стелі — порахуємо потрібну тепловіддачу і покажемо моделі, які впораються." link={{ href: "/pidbir", label: "Детальний підбір" }} />
          <Calc cards={calcCards} compact />
        </div>
      </section>

      <section className="section section-colors">
        <div className="container">
          <Colors finishes={finishes} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Обирають найчастіше" title={<>Моделі, які <em>люблять</em></>} link={{ href: "/katalog/dyzainerski-radiatory", label: "Усі дизайн-радіатори" }} />
          <div className="grid">
            {popular.map((c, i) => (
              <div className="grid-cell" key={c.id} data-reveal style={{ ["--d" as string]: `${(i % 4) * 0.06}s` }}>
                <ProductCard c={c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <SectionHead eyebrow="Чому Тепло Гарант" title={<>Тепло з <em>гарантією</em> — це про нас</>} />
          <div className="perks">
            {(
              [
                { icon: "shield", t: "Офіційно й без посередників", d: "Офіційний дистриб’ютор Stelrad, прямі постачання IRSAP, Zehnder і Vasco — тому ціни нижчі." },
                { icon: "flame", t: "Гарантія до 10 років", d: "Офіційна гарантія виробника на радіатори та обмін або повернення протягом 14 днів." },
                { icon: "truck", t: "Свій склад і автопарк", d: "Склад за 10 км від Львова, доставка нашим авто по місту та перевізниками по всій Україні." },
                { icon: "wrench", t: "Підбір і консультація", d: "Порахуємо потужність, підкажемо підключення й колір — безкоштовно, для квартири, будинку чи об’єкта." },
              ] as { icon: IconName; t: string; d: string }[]
            ).map((x, i) => (
              <div className="perk spot" key={x.t} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="perk-icon">
                  <Icon name={x.icon} size={26} stroke={1.4} />
                </span>
                <b>{x.t}</b>
                <p>{x.d}</p>
              </div>
            ))}
          </div>
          <div className="numbers" data-reveal>
            <div>
              <b data-count={new Date().getFullYear() - site.since}>{new Date().getFullYear() - site.since}</b>
              <span>років на ринку</span>
            </div>
            <div>
              <b data-count={brands.length}>{brands.length}</b>
              <span>виробників</span>
            </div>
            <div>
              <b data-count={products.length}>{products.length}</b>
              <span>моделей у каталозі</span>
            </div>
            <div>
              <b data-count={reviewCount()} data-suffix="+">{reviewCount()}+</b>
              <span>відгуків покупців</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Бренди" title={<>Європейська якість, <em>перевірена роками</em></>} lead="Італійський дизайн, німецька інженерія, бельгійська скульптурність — і надійна класика для кожного дому." link={{ href: "/brendy", label: `Усі ${brands.length} брендів` }} />
          <Brands brands={brands} limit={8} />
        </div>
      </section>

      <section className="band band-store">
        <img className="band-img" src="/images/p/12675-0.webp" alt="" aria-hidden="true" data-parallax="0.08" />
        <div className="band-shade" aria-hidden="true" />
        <div className="container band-inner">
          <div className="band-copy">
            <p className="eyebrow">Шоуруми</p>
            <h2 className="display-lg" data-reveal>
              Подивіться <em>наживо</em>
            </h2>
            <p className="section-lead" data-reveal>
              Фарбування, фактуру й розміри краще оцінити очима. Приїжджайте на склад під Львовом або в шоуруми в Києві та Івано-Франківську — чи пройдіться експозицією онлайн.
            </p>
            <div className="band-actions" data-reveal>
              <a href={site.tourHref} className="btn btn-lg btn-glow" target="_blank" rel="noopener noreferrer">
                <Icon name="cube" size={18} /> 3D-тур шоуруму
              </a>
              <CallbackButton className="btn btn-lg btn-outline-light">Записатися на візит</CallbackButton>
            </div>
          </div>
          <ul className="rooms">
            {showrooms.map((r, i) => (
              <li key={r.id} className="room" data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="room-city">{r.city}</span>
                <b>{r.title}</b>
                <span>{r.address}</span>
                <small>{r.hours}</small>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-reviews">
        <div className="container">
          <SectionHead eyebrow="Відгуки" title={<>Що кажуть ті, кому <em>вже тепло</em></>} lead={`${reviewCount()} відгуків покупців на сторінках товарів — ось кілька свіжих.`} />
        </div>
        <Reviews reviews={reviews} />
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Поради" title={<>Розбираємося <em>в теплі</em></>} link={{ href: "/blog", label: `Усі ${posts.length} статей` }} />
          <div className="posts">
            {posts.filter((p) => p.cover).slice(0, 3).map((p, i) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="post" data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }} data-cursor="Читати">
                <span className="post-img">
                  <img src={`/images/blog/${p.slug}.webp`} alt="" loading="lazy" />
                </span>
                <small>{p.mins} хв читання</small>
                <b>{p.title}</b>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
