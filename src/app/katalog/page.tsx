import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { PageHero } from "@/components/Shared";
import { allCards, brands, products, sections } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог радіаторів і рушникосушок",
  description: `${products.length} моделей: дизайнерські й сталеві радіатори, водяні та електричні рушникосушки, крани, термоголовки й ТЕНи від IRSAP, Zehnder, Vasco, Stelrad, Quinn і Purmo.`,
  alternates: { canonical: "/katalog" },
};

export default function Katalog() {
  return (
    <>
      <PageHero
        eyebrow="Каталог"
        title={<>Тепло, яке <em>видно</em></>}
        lead={`${products.length} моделей від ${brands.length} європейських і українських виробників. Фільтруйте за розділом, кольором, підключенням і ціною — або просто введіть модель чи розмір.`}
        crumbs={[{ href: "/katalog", label: "Каталог" }]}
      />
      <section className="section-tight">
        <div className="container">
          <Suspense fallback={<div className="grid-skeleton" />}>
            <Catalog cards={allCards()} sections={sections.map(({ id, name, count }) => ({ id, name, count }))} brands={brands.map(({ id, name }) => ({ id, name }))} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
