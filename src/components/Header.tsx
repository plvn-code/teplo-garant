"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { nav, site } from "@/lib/site";
import { Icon, SocialIcon } from "./Icons";
import { Logo } from "./Logo";

export type MenuSection = { id: string; name: string; count: number; subs: { id: string; name: string }[]; art?: string };
export type MenuBrand = { id: string; name: string };

export const openSearch = (q = "") => window.dispatchEvent(new CustomEvent("open-search", { detail: { q } }));

const TOP = ["/akcii", "/brendy", "/pidbir", "/pro-nas", "/kontakty"];

export function Header({ sections, brands, total }: { sections: MenuSection[]; brands: MenuBrand[]; total: number }) {
  const pathname = usePathname();
  const home = pathname === "/";
  const [over, setOver] = useState(home);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(sections[0]?.id);
  const { count, setOpen, ready } = useCart();
  const closeTimer = useRef(0);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setOver(home && y < window.innerHeight * 0.7);
      setHidden(y > 520 && y > last + 2 ? true : y < last - 2 ? false : (h) => h);
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [home]);

  useEffect(() => {
    setMega(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menu);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(false);
        setMenu(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const enter = () => {
    window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setMega(false), 160);
  };

  const cur = sections.find((s) => s.id === active) ?? sections[0];
  const cls = ["header", over && !mega && !menu ? "is-over" : "", hidden && !mega && !menu ? "is-hidden" : "", mega ? "is-mega" : ""].join(" ");

  return (
    <>
      <header className={cls}>
        <div className="header-strip">
          <div className="container header-strip-row">
            <span>
              <Icon name="pin" size={14} /> Склад під Львовом · шоуруми в Києві та Івано-Франківську
            </span>
            <span className="header-strip-mid">
              <Icon name="shield" size={14} /> Офіційний дистриб’ютор Stelrad · гарантія до 10 років
            </span>
            <span>
              <Icon name="clock" size={14} /> {site.hoursShort}
            </span>
          </div>
        </div>
        <div className="container header-row">
          <Link href="/" className="header-logo" aria-label="Teplogarant — на головну">
            <Logo />
          </Link>

          <div className="header-cat" onMouseEnter={enter} onMouseLeave={leave}>
            <button type="button" className={`header-cat-btn ${mega ? "is-on" : ""}`} aria-expanded={mega} aria-controls="mega" onClick={() => setMega((m) => !m)}>
              <Icon name="grid" size={17} />
              Каталог
              <Icon name="chevron" size={15} className="chev" />
            </button>
          </div>

          <button type="button" className="header-search" onClick={() => openSearch()} aria-label="Пошук товарів">
            <Icon name="search" size={18} />
            <span>Пошук: {total} моделей</span>
            <kbd>⌘K</kbd>
          </button>

          <nav className="header-nav" aria-label="Головне меню">
            {nav.filter((n) => TOP.includes(n.href)).map((n) => (
              <Link key={n.href} href={n.href} className={`${pathname.startsWith(n.href) ? "is-active" : ""} ${n.href === "/akcii" ? "is-sale" : ""}`}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <a href={site.phoneHref} className="header-phone">
              <small>Консультація</small>
              {site.phone}
            </a>
            <button type="button" className="icon-btn header-search-sm" onClick={() => openSearch()} aria-label="Пошук">
              <Icon name="search" size={20} />
            </button>
            <button type="button" className="icon-btn cart-btn" data-cart-target onClick={() => setOpen(true)} aria-label={`Кошик${ready && count ? `: ${count}` : ""}`}>
              <Icon name="bag" size={21} />
              {ready && count > 0 && <span className="cart-count">{count > 99 ? "99+" : count}</span>}
            </button>
            <button type="button" className="burger" aria-label={menu ? "Закрити меню" : "Відкрити меню"} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((m) => !m)}>
              <span />
              <span />
            </button>
          </div>
        </div>

        <div id="mega" className={`mega ${mega ? "is-open" : ""}`} onMouseEnter={enter} onMouseLeave={leave} inert={!mega}>
          <div className="container mega-grid">
            <ul className="mega-sections">
              {sections.map((s) => (
                <li key={s.id}>
                  <Link href={`/katalog/${s.id}`} className={s.id === cur?.id ? "is-on" : ""} onMouseEnter={() => setActive(s.id)} onFocus={() => setActive(s.id)}>
                    {s.name}
                    <small>{s.count}</small>
                    <Icon name="chevronRight" size={15} />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mega-panel" key={cur?.id}>
              <div className="mega-panel-head">
                <p className="eyebrow">Розділ</p>
                <Link href={`/katalog/${cur?.id}`} className="mega-title">
                  {cur?.name} <Icon name="arrow" size={22} />
                </Link>
              </div>
              {cur && cur.subs.length > 0 ? (
                <ul className="mega-subs">
                  {cur.subs.map((s, i) => (
                    <li key={s.id} style={{ ["--i" as string]: i }}>
                      <Link href={`/katalog/${cur.id}?sub=${s.id}`}>{s.name}</Link>
                    </li>
                  ))}
                  <li style={{ ["--i" as string]: cur.subs.length }}>
                    <Link href={`/katalog/${cur.id}?sale=1`} className="is-sale">
                      Зі знижкою
                    </Link>
                  </li>
                </ul>
              ) : (
                <p className="mega-empty">Усі моделі розділу на одній сторінці — з фільтрами за ціною, кольором і брендом.</p>
              )}
              {cur?.art && <img className="mega-art" src={cur.art} alt="" aria-hidden="true" />}
            </div>
            <div className="mega-brands">
              <p className="eyebrow">Бренди</p>
              <ul>
                {brands.map((b) => (
                  <li key={b.id}>
                    <Link href={`/brendy/${b.id}`}>{b.name}</Link>
                  </li>
                ))}
              </ul>
              <Link href="/brendy" className="link-arrow">
                Усі бренди <Icon name="arrow" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div className={`mega-scrim ${mega ? "is-on" : ""}`} onClick={() => setMega(false)} aria-hidden="true" />

      <div id="mobile-menu" className={`mmenu ${menu ? "is-open" : ""}`} inert={!menu}>
        <div className="mmenu-inner">
          <button type="button" className="mmenu-search" onClick={() => { setMenu(false); openSearch(); }}>
            <Icon name="search" size={18} /> Пошук моделей
          </button>
          <p className="eyebrow">Каталог</p>
          <ul className="mmenu-sections">
            {sections.map((s, i) => (
              <li key={s.id} style={{ ["--i" as string]: i }}>
                <Link href={`/katalog/${s.id}`}>
                  {s.name} <small>{s.count}</small>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mmenu-links">
            {nav.slice(1).map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
            <Link href="/blog">Поради</Link>
          </div>
          <a className="mmenu-phone" href={site.phoneHref}>
            <Icon name="phone" size={18} /> {site.phone}
          </a>
          <p className="mmenu-note">
            {site.addressShort} · {site.hours}
          </p>
          <div className="socials">
            {site.socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                <SocialIcon name={s.name} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
