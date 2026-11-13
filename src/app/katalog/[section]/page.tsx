import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { PageHero } from "@/components/Shared";
import { brands, getSection, products, sections, toCard } from "@/lib/catalog";
import { goods } from "@/lib/format";

export const dynamicParams = false;
export const generateStaticParams = () => sections.map((s) => ({ section: s.id }));

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const s = getSection((await params).section);
  if (!s) return {};
  return {
    title: `${s.name} — купити у Львові з доставкою`,
    description: `${s.name}: ${s.lead} ${goods(s.count)} у каталозі Teplogarant, доставка по Україні.`,
    alternates: { canonical: `/katalog/${s.id}` },
  };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const s = getSection((await params).section);
  if (!s) notFound();
  const list = products.filter((p) => p.section === s.id);
  return (
    <>
      <PageHero eyebrow={goods(s.count)} title={s.name} lead={s.lead} crumbs={[{ href: "/katalog", label: "Каталог" }, { href: `/katalog/${s.id}`, label: s.name }]}>
        <nav className="hero-sections" aria-label="Інші розділи">
          {sections.filter((x) => x.id !== s.id).map((x) => (
            <Link key={x.id} href={`/katalog/${x.id}`} className="chip chip-sm">
              {x.short}
            </Link>
          ))}
        </nav>
      </PageHero>
      <section className="section-tight">
        <div className="container">
          <Suspense fallback={<div className="grid-skeleton" />}>
            <Catalog cards={list.map(toCard)} subs={s.subs} brands={brands.map(({ id, name }) => ({ id, name }))} fixed="section" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
