import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { PageHero } from "@/components/Shared";
import { brands, getBrand, products, sections, toCard } from "@/lib/catalog";
import { goods } from "@/lib/format";

export const dynamicParams = false;
export const generateStaticParams = () => brands.map((b) => ({ id: b.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const b = getBrand((await params).id);
  if (!b) return {};
  return { title: `${b.name} — радіатори та рушникосушки`, description: `${b.name} (${b.country}): ${b.line}. ${goods(b.count)} у Teplogarant, доставка по Україні.`, alternates: { canonical: `/brendy/${b.id}` } };
}

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const b = getBrand((await params).id);
  if (!b) notFound();
  const list = products.filter((p) => p.brand === b.id);
  const secs = sections.filter((s) => list.some((p) => p.section === s.id)).map((s) => ({ id: s.id, name: s.name, count: list.filter((p) => p.section === s.id).length }));
  const art = list.find((p) => p.imgs.some((i) => i[0] === "p"));
  const artN = art ? art.imgs.findIndex((i) => i[0] === "p") : -1;
  return (
    <>
      <PageHero eyebrow={`${b.country} · ${goods(b.count)}`} title={b.name} lead={b.line} crumbs={[{ href: "/brendy", label: "Бренди" }, { href: `/brendy/${b.id}`, label: b.name }]}>
        {art && <img className="page-hero-art" src={`/images/p/${art.id}-${artN}.webp`} alt="" aria-hidden="true" />}
      </PageHero>
      <section className="section-tight">
        <div className="container">
          <Suspense fallback={<div className="grid-skeleton" />}>
            <Catalog cards={list.map(toCard)} sections={secs.length > 1 ? secs : undefined} brands={[]} fixed="brand" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
