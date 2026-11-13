import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox, Gallery, Variants } from "@/components/Buy";
import { CallbackButton } from "@/components/Callback";
import { Icon, type IconName } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { Crumbs } from "@/components/Shared";
import { getBrand, getProduct, getSection, products, related, subName, toCard } from "@/lib/catalog";
import { price } from "@/lib/format";
import { delivery, payment, site } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const text = p.desc.find((d) => d[0] === "p")?.[1];
  return {
    title: p.name,
    description: `${p.name} — ${price(p.price)}${p.old ? ` замість ${price(p.old)}` : ""}. ${text ? text.slice(0, 110) + "… " : ""}Teplogarant: офіційні постачання, гарантія, доставка по Україні.`,
    alternates: { canonical: `/tovar/${p.slug}` },
    openGraph: p.imgs.length ? { images: [`/images/p/${p.id}-0.webp`] } : undefined,
  };
}

const FACTS: { key: string; label: string; icon: IconName }[] = [
  { key: "dims", label: "Висота × ширина", icon: "ruler" },
  { key: "power", label: "Тепловіддача", icon: "flame" },
  { key: "area", label: "Площа обігріву", icon: "home" },
  { key: "con", label: "Підключення", icon: "wrench" },
  { key: "warranty", label: "Гарантія", icon: "shield" },
  { key: "country", label: "Виробництво", icon: "globe" },
];

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const c = toCard(p);
  const sec = getSection(p.section);
  const brand = p.brand ? getBrand(p.brand) : undefined;
  const sub = subName(p.section, p.sub);
  const more = related(p, 8);
  const sameBrand = brand ? products.filter((q) => q.brand === brand.id && q.id !== p.id && q.section !== p.section).slice(0, 4).map(toCard) : [];
  const facts = FACTS.map((f) => {
    const raw = (p as unknown as Record<string, string | null>)[f.key];
    const v = f.key === "dims" && raw ? `${raw} мм` : f.key === "con" && raw ? `${raw}` : raw;
    return { ...f, v };
  }).filter((f) => f.v);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.code ?? String(p.id),
    image: p.imgs.length ? `${site.url}/images/p/${p.id}-0.webp` : undefined,
    brand: brand ? { "@type": "Brand", name: brand.name } : undefined,
    category: sec?.name,
    aggregateRating: p.rating && p.reviews.length ? { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews.length } : undefined,
    offers: { "@type": "Offer", price: p.price, priceCurrency: "UAH", availability: `https://schema.org/${p.stock ? "InStock" : "PreOrder"}`, url: `${site.url}/tovar/${p.slug}`, seller: { "@type": "Organization", name: "Teplogarant" } },
  };

  const crumbs = [{ href: "/katalog", label: "Каталог" }];
  if (sec) crumbs.push({ href: `/katalog/${sec.id}`, label: sec.name });
  if (sec && p.sub && sub) crumbs.push({ href: `/katalog/${sec.id}?sub=${p.sub}`, label: sub });

  return (
    <>
      <section className="product">
        <div className="product-glow" aria-hidden="true" />
        <div className="container">
          <Crumbs items={[...crumbs, { href: `/tovar/${p.slug}`, label: p.name }]} />
          <div className="product-grid">
            <div className="product-media fade-up">
              <Gallery c={c} shots={p.imgs} />
            </div>
            <div className="product-info">
              <div className="product-tags fade-up">
                {brand && (
                  <Link href={`/brendy/${brand.id}`} className="product-brand">
                    {brand.name}
                  </Link>
                )}
                {p.popular && <span className="badge badge-hot">Хіт продажів</span>}
                {p.rating && p.reviews.length > 0 && (
                  <a href="#vidguky" className="product-rating" aria-label={`Рейтинг ${p.rating} з 5, відгуків: ${p.reviews.length}`}>
                    <span className="stars" style={{ ["--r" as string]: p.rating }} aria-hidden="true" />
                    {p.reviews.length} {p.reviews.length === 1 ? "відгук" : p.reviews.length < 5 ? "відгуки" : "відгуків"}
                  </a>
                )}
              </div>
              <h1 className="product-title fade-up" style={{ animationDelay: ".06s" }}>
                {p.name}
              </h1>
              {p.code && (
                <p className="product-code fade-up" style={{ animationDelay: ".08s" }}>
                  Код товару: {p.code}
                </p>
              )}
              {facts.length > 0 && (
                <ul className="facts fade-up" style={{ animationDelay: ".1s" }}>
                  {facts.map((f) => (
                    <li key={f.key}>
                      <Icon name={f.icon} size={18} />
                      <span>
                        <small>{f.label}</small>
                        {f.v}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="fade-up" style={{ animationDelay: ".14s" }}>
                <Variants groups={p.variants} />
              </div>
              <div className="fade-up" style={{ animationDelay: ".18s" }}>
                <BuyBox c={c} />
              </div>
              <ul className="product-perks fade-up" style={{ animationDelay: ".22s" }}>
                <li>
                  <Icon name="truck" size={20} />
                  <span>
                    <b>Доставка по Україні за 1–3 дні</b> Нова пошта, SAT, Delivery або нашим авто по Львову
                  </span>
                </li>
                <li>
                  <Icon name="shield" size={20} />
                  <span>
                    <b>Офіційна гарантія{p.warranty ? ` ${p.warranty}` : ""}</b> від виробника, повернення протягом 14 днів
                  </span>
                </li>
                <li>
                  <Icon name="card" size={20} />
                  <span>
                    <b>Оплата</b> готівкою при отриманні або за реквізитами
                  </span>
                </li>
              </ul>
              <div className="product-help fade-up" style={{ animationDelay: ".26s" }}>
                <span>Не впевнені щодо потужності чи підключення?</span>
                <CallbackButton className="link-btn" product={undefined}>
                  Запитайте інженера
                </CallbackButton>
                <a href={site.phoneHref}>{site.phone}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight product-details">
        <div className="container product-details-grid">
          <div className="product-main">
            <nav className="ptabs" aria-label="Розділи сторінки товару">
              <a href="#opys">Опис</a>
              {p.specs.length > 0 && <a href="#kharakterystyky">Характеристики</a>}
              {p.reviews.length > 0 && <a href="#vidguky">Відгуки · {p.reviews.length}</a>}
              <a href="#dostavka">Доставка</a>
            </nav>
            <div className="product-desc" id="opys">
              <h2 className="h3">Опис</h2>
              {p.video && (
                <a className="video-link" href={`https://www.youtube.com/watch?v=${p.video}`} target="_blank" rel="noopener noreferrer">
                  <span className="video-link-play">
                    <Icon name="play" size={20} />
                  </span>
                  <span>
                    <b>Відеоогляд моделі</b>
                    <small>Дивитися на YouTube</small>
                  </span>
                  <Icon name="arrowUpRight" size={18} />
                </a>
              )}
              {p.desc.length ? (
                <div className="rich">
                  {groupDesc(p.desc).map((b, i) =>
                    b.kind === "ul" ? (
                      <ul key={i}>
                        {b.items.map((t, j) => (
                          <li key={j}>{t}</li>
                        ))}
                      </ul>
                    ) : b.kind === "h" ? (
                      <h3 key={i}>{b.items[0]}</h3>
                    ) : (
                      <p key={i}>{b.items[0]}</p>
                    ),
                  )}
                </div>
              ) : (
                <p className="muted">Детальний опис, схеми підключення та тепловий розрахунок надішле менеджер — просто залиште номер.</p>
              )}
            </div>
            {p.specs.length > 0 && (
              <div className="product-desc" id="kharakterystyky">
                <h2 className="h3">Характеристики</h2>
                <dl className="specs">
                  {brand && (
                    <div>
                      <dt>Виробник</dt>
                      <dd>
                        <Link href={`/brendy/${brand.id}`}>{brand.name}</Link>
                      </dd>
                    </div>
                  )}
                  {p.specs.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                  {sec && (
                    <div>
                      <dt>Розділ</dt>
                      <dd>
                        <Link href={`/katalog/${sec.id}`}>{sec.name}</Link>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
            {p.reviews.length > 0 && (
              <div className="product-desc" id="vidguky">
                <h2 className="h3">Відгуки покупців</h2>
                <ul className="reviews-list">
                  {p.reviews.map((r, i) => (
                    <li key={i} className="review">
                      <div className="review-head">
                        <span className="review-ava" aria-hidden="true">
                          {r.n.slice(0, 1)}
                        </span>
                        <b>{r.n}</b>
                        <span className="stars" style={{ ["--r" as string]: r.r }} aria-label={`${r.r} з 5`} />
                        {r.d && <time dateTime={r.d}>{new Date(r.d).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}</time>}
                      </div>
                      <p>{r.t}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <aside className="product-ship" id="dostavka">
            <h2 className="h3">Доставка</h2>
            <ul>
              {delivery.map((d) => (
                <li key={d.id}>
                  <b>{d.title}</b>
                  <span>{d.note}</span>
                </li>
              ))}
            </ul>
            <h2 className="h3">Оплата</h2>
            <ul>
              {payment.map((d) => (
                <li key={d.id}>
                  <b>{d.title}</b>
                  <span>{d.note}</span>
                </li>
              ))}
            </ul>
            <Link href="/dostavka" className="link-arrow">
              Детальніше <Icon name="arrow" size={16} />
            </Link>
          </aside>
        </div>
      </section>

      {more.length > 0 && (
        <section className="section-tight">
          <div className="container">
            <div className="section-head">
              <h2 className="display-sm">Схожі моделі</h2>
              {sec && (
                <Link href={`/katalog/${sec.id}${p.sub ? `?sub=${p.sub}` : ""}`} className="link-arrow">
                  Усі в розділі <Icon name="arrow" size={18} />
                </Link>
              )}
            </div>
            <div className="grid grid-scroll">
              {more.map((x) => (
                <div className="grid-cell" key={x.id}>
                  <ProductCard c={x} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {sameBrand.length > 0 && brand && (
        <section className="section-tight">
          <div className="container">
            <div className="section-head">
              <h2 className="display-sm">Ще від {brand.name}</h2>
              <Link href={`/brendy/${brand.id}`} className="link-arrow">
                Усі товари бренду <Icon name="arrow" size={18} />
              </Link>
            </div>
            <div className="grid grid-scroll">
              {sameBrand.map((x) => (
                <div className="grid-cell" key={x.id}>
                  <ProductCard c={x} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}

/** Consecutive list items become one <ul>. */
function groupDesc(desc: [string, string][]) {
  const out: { kind: "p" | "h" | "ul"; items: string[] }[] = [];
  for (const [k, t] of desc) {
    if (k === "li") {
      const last = out[out.length - 1];
      if (last?.kind === "ul") last.items.push(t);
      else out.push({ kind: "ul", items: [t] });
    } else out.push({ kind: k === "h" ? "h" : "p", items: [t] });
  }
  return out;
}
