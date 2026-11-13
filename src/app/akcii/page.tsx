import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { PageHero } from "@/components/Shared";
import { brands, saleCards, sections } from "@/lib/catalog";
import { money } from "@/lib/format";

export const metadata: Metadata = {
  title: "Акції та розпродаж радіаторів",
  description: "Знижки до 80% на дизайнерські радіатори, рушникосушки та комплектуючі IRSAP, Zehnder, Vasco, Thermic і Stelrad. Кількість обмежена.",
  alternates: { canonical: "/akcii" },
};

export default function SalePage() {
  const list = saleCards();
  const best = Math.max(...list.map((c) => Math.round((1 - c.p / (c.o ?? c.p)) * 100)));
  const saved = list.reduce((n, c) => n + ((c.o ?? c.p) - c.p), 0);
  const secs = sections.map((s) => ({ id: s.id, name: s.name, count: list.filter((c) => c.sec === s.id).length })).filter((s) => s.count);
  return (
    <>
      <PageHero
        eyebrow={`${list.length} пропозицій · до −${best}%`}
        title={<>Розпродаж <em>тепла</em></>}
        lead={`Спеціальні ціни на дизайнерські радіатори, рушникосушки й комплектуючі — разом економія понад ${money(saved)} ₴. Кількість обмежена: наявність уточнюйте в менеджера.`}
        crumbs={[{ href: "/akcii", label: "Акції" }]}
      />
      <section className="section-tight">
        <div className="container">
          <Suspense fallback={<div className="grid-skeleton" />}>
            <Catalog cards={list} sections={secs} brands={brands.map(({ id, name }) => ({ id, name }))} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
