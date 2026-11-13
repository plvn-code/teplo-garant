import type { Metadata } from "next";
import Link from "next/link";
import { Brands } from "@/components/home/Brands";
import { Icon } from "@/components/Icons";
import { PageHero, SectionHead } from "@/components/Shared";
import { brands, products, reviewCount } from "@/lib/catalog";
import { showrooms, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Про компанію Тепло Гарант",
  description: "З 2000 року Teplogarant постачає радіатори опалення європейських брендів. Офіційний дистриб’ютор Stelrad, склад під Львовом, шоуруми в Києві та Івано-Франківську.",
  alternates: { canonical: "/pro-nas" },
};

const PRINCIPLES = [
  { t: "Найнижчі ціни без посередників", d: "Статус офіційного дистриб’ютора дозволяє не переплачувати за перепродаж. А 10-річна гарантія підтверджує якість приладів." },
  { t: "Постійне оновлення асортименту", d: "Регулярно привозимо новинки відомих брендів, щоб ви могли підібрати прилад за потужністю, габаритами, кольором і бюджетом." },
  { t: "Швидка обробка й доставка", d: "Асортимент з онлайн-каталогу — на нашому складі. Доставляємо власним автопарком по Львову й перевізниками по Україні." },
  { t: "Професійна консультація", d: "Допомагаємо роздрібним клієнтам і будівельним компаніям: розрахунок, підбір підключення, дизайнерське фарбування." },
];

export default function About() {
  const years = new Date().getFullYear() - site.since;
  return (
    <>
      <PageHero eyebrow={`З ${site.since} року`} title={<>Тепло Гарант — <em>гарантія тепла</em></>} lead="Компанія-імпортер радіаторів опалення. Головний офіс і склад — під Львовом, шоуруми — у Києві та Івано-Франківську. Постачаємо по всій Україні: від квартир до великих будівельних об’єктів." crumbs={[{ href: "/pro-nas", label: "Про нас" }]} />

      <section className="section-tight">
        <div className="container">
          <div className="numbers numbers-dark" data-reveal>
            <div>
              <b data-count={years}>{years}</b>
              <span>років на ринку</span>
            </div>
            <div>
              <b data-count={products.length}>{products.length}</b>
              <span>моделей у каталозі</span>
            </div>
            <div>
              <b data-count={brands.length}>{brands.length}</b>
              <span>виробників</span>
            </div>
            <div>
              <b data-count={reviewCount()} data-suffix="+">{reviewCount()}+</b>
              <span>відгуків</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div>
            <p className="eyebrow" data-reveal>
              Хто ми
            </p>
            <h2 className="display-md" data-reveal>
              Надійний партнер для <em>дому й бізнесу</em>
            </h2>
          </div>
          <div className="rich about-text" data-reveal>
            <p>
              З {site.since} року Теплогарант спеціалізується на радіаторах опалення й пропонує високотехнологічні прилади європейських брендів. Географія постачань охоплює всю Україну: постійні клієнти є практично в кожному регіоні, серед них — великі будівельні компанії.
            </p>
            <p>
              Ми — офіційний представник нідерландського виробника <Link href="/brendy/stelrad">Stelrad</Link>, а також постачаємо радіатори <Link href="/brendy/vasco">Vasco</Link>, <Link href="/brendy/zehnder">Zehnder</Link> і <Link href="/brendy/irsap">IRSAP</Link>. Stelrad відомий якістю матеріалів і широким модельним рядом, Vasco і Zehnder — інноваціями, екологічністю та дизайном.
            </p>
            <p>Окрім радіаторів — рушникосушки з різними характеристиками й фарбуваннями, щоб дім був не лише теплим і затишним, а й унікальним.</p>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <SectionHead eyebrow="Принципи" title={<>Як ми <em>працюємо</em></>} />
          <ol className="how">
            {PRINCIPLES.map((x, i) => (
              <li key={x.t} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span>0{i + 1}</span>
                <b>{x.t}</b>
                <p>{x.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Де нас знайти" title={<>Склад і <em>шоуруми</em></>} link={{ href: "/kontakty", label: "Контакти" }} />
          <ul className="rooms rooms-grid">
            {showrooms.map((r, i) => (
              <li key={r.id} className="room" data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="room-city">{r.city}</span>
                <b>{r.title}</b>
                <span>{r.address}</span>
                <small>{r.hours}</small>
                <p>{r.note}</p>
              </li>
            ))}
          </ul>
          <div className="band-actions">
            <a href={site.tourHref} className="btn btn-lg btn-glow" target="_blank" rel="noopener noreferrer">
              <Icon name="cube" size={18} /> 3D-тур шоуруму
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Бренди" title={<>З ким ми <em>працюємо</em></>} link={{ href: "/brendy", label: "Усі бренди" }} />
          <Brands brands={brands} limit={8} />
        </div>
      </section>
    </>
  );
}
