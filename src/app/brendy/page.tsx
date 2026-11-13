import type { Metadata } from "next";
import { Brands } from "@/components/home/Brands";
import { PageHero } from "@/components/Shared";
import { brands, products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Бренди радіаторів і рушникосушок",
  description: "IRSAP, Zehnder, Vasco, Stelrad, Quinn, Purmo, Radson, Terma та інші виробники в каталозі Teplogarant. Офіційний дистриб’ютор Stelrad.",
  alternates: { canonical: "/brendy" },
};

export default function BrandsPage() {
  return (
    <>
      <PageHero
        eyebrow={`${brands.length} виробників · ${products.length} моделей`}
        title={<>Бренди, з якими <em>тепло</em></>}
        lead="Італійський дизайн IRSAP, швейцарсько-німецька інженерія Zehnder, бельгійська скульптурність Vasco і надійна класика Stelrad — офіційно, з гарантією виробника."
        crumbs={[{ href: "/brendy", label: "Бренди" }]}
      />
      <section className="section-tight">
        <div className="container">
          <Brands brands={brands} />
        </div>
      </section>
    </>
  );
}
