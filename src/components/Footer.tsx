import Link from "next/link";
import { brands, sections } from "@/lib/catalog";
import { site } from "@/lib/site";
import { CallbackButton } from "./Callback";
import { Icon, SocialIcon } from "./Icons";
import { Logo } from "./Logo";
import { MadeBy } from "./MadeBy";

const INFO = [
  { href: "/akcii", label: "Акції та розпродаж" },
  { href: "/pidbir", label: "Підбір потужності" },
  { href: "/pro-nas", label: "Про компанію" },
  { href: "/dostavka", label: "Доставка й оплата" },
  { href: "/dostavka#povernennia", label: "Обмін і повернення" },
  { href: "/blog", label: "Поради та статті" },
  { href: "/kontakty", label: "Контакти й шоуруми" },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container">
        <div className="footer-cta" data-reveal>
          <div>
            <p className="eyebrow">Безкоштовна консультація</p>
            <h2 className="display-md">
              Розрахуємо тепло <em>для вашого дому</em>
            </h2>
          </div>
          <div className="footer-cta-actions">
            <a href={site.phoneHref} className="btn btn-lg btn-glow">
              <Icon name="phone" size={18} /> {site.phone}
            </a>
            <CallbackButton className="btn btn-lg btn-outline">Передзвоніть мені</CallbackButton>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <Logo size={40} />
            <p>Дизайнерські та сталеві радіатори, рушникосушки й комплектуючі від європейських брендів. Тепло Гарант — з {site.since} року.</p>
            <div className="socials">
              {site.socials.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.name} ${s.handle}`}>
                  <SocialIcon name={s.name} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="footer-h">Каталог</p>
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <Link href={`/katalog/${s.id}`}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-h">Бренди</p>
            <ul>
              {brands.slice(0, 9).map((b) => (
                <li key={b.id}>
                  <Link href={`/brendy/${b.id}`}>{b.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-h">Покупцям</p>
            <ul>
              {INFO.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-contacts">
            <p className="footer-h">Склад і офіс</p>
            <a href={site.mapHref} target="_blank" rel="noopener noreferrer">
              <Icon name="pin" size={16} /> {site.address}
            </a>
            <span>
              <Icon name="clock" size={16} /> {site.hours}
            </span>
            <a href={site.phoneHref}>
              <Icon name="phone" size={16} /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`}>
              <Icon name="mail" size={16} /> {site.email}
            </a>
            <a href={site.tourHref} target="_blank" rel="noopener noreferrer">
              <Icon name="cube" size={16} /> 3D-тур шоуруму
            </a>
          </div>
        </div>
      </div>

      <div className="footer-word" aria-hidden="true">
        <b>T</b>EPLO<b>G</b>ARANT
      </div>

      <div className="container footer-bottom">
        <span>
          © {site.since}–{new Date().getFullYear()} Teplogarant · Тепло Гарант
        </span>
        <MadeBy />
      </div>
    </footer>
  );
}
