import Link from "next/link";
import { Icon } from "./Icons";

export function Crumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Навігація">
      <Link href="/">Головна</Link>
      {items.map((c, i) => (
        <span key={c.href}>
          <Icon name="chevronRight" size={13} />
          {i === items.length - 1 ? <span aria-current="page">{c.label}</span> : <Link href={c.href}>{c.label}</Link>}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({ eyebrow, title, lead, crumbs, children }: { eyebrow: string; title: React.ReactNode; lead?: string; crumbs: { href: string; label: string }[]; children?: React.ReactNode }) {
  return (
    <section className="page-hero">
      <div className="page-hero-glow" aria-hidden="true" />
      <div className="container">
        <Crumbs items={crumbs} />
        <p className="eyebrow fade-up">{eyebrow}</p>
        <h1 className="display-lg fade-up" style={{ animationDelay: ".08s" }}>
          {title}
        </h1>
        {lead && (
          <p className="page-lead fade-up" style={{ animationDelay: ".16s" }}>
            {lead}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, lead, link }: { eyebrow: string; title: React.ReactNode; lead?: string; link?: { href: string; label: string } }) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow" data-reveal>
          {eyebrow}
        </p>
        <h2 className="display-md" data-reveal>
          {title}
        </h2>
        {lead && (
          <p className="section-lead" data-reveal>
            {lead}
          </p>
        )}
      </div>
      {link && (
        <Link href={link.href} className="link-arrow" data-reveal>
          {link.label} <Icon name="arrow" size={18} />
        </Link>
      )}
    </div>
  );
}

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (hidden?: boolean) => (
    <div className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={i}>
          {t}
          <i />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track">
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
