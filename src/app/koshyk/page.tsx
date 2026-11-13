import type { Metadata } from "next";
import { Checkout } from "@/components/Checkout";
import { Crumbs } from "@/components/Shared";

export const metadata: Metadata = { title: "Кошик і оформлення замовлення", robots: { index: false } };

export default function CartPage() {
  return (
    <section className="page-hero page-hero-sm">
      <div className="page-hero-glow" aria-hidden="true" />
      <div className="container">
        <Crumbs items={[{ href: "/koshyk", label: "Кошик" }]} />
        <h1 className="display-md fade-up">Оформлення замовлення</h1>
        <Checkout />
      </div>
    </section>
  );
}
