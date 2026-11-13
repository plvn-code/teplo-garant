import type { Metadata } from "next";
import { Calc } from "@/components/home/Calc";
import { PageHero, SectionHead } from "@/components/Shared";
import { allCards } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Підбір радіатора за площею — калькулятор потужності",
  description: "Порахуйте, скільки тепла потрібно кімнаті: площа, висота стелі, стіни й вікна. Покажемо радіатори потрібної тепловіддачі, а точний розрахунок зробить інженер безкоштовно.",
  alternates: { canonical: "/pidbir" },
};

const TIPS = [
  { t: "Під кожне вікно", d: "Радіатор під вікном відсікає холодне повітря від скла. Ширина приладу — 70–80% ширини вікна." },
  { t: "Запас 10–20%", d: "Потужність краще брати з невеликим запасом, а температуру регулювати термоголовкою." },
  { t: "Температурний режим", d: "Паспортна тепловіддача вказана для певного режиму системи. Для теплового насоса чи конденсаційного котла приладу потрібно більше." },
  { t: "Підключення", d: "Нижнє підключення ховає труби в підлозі, бокове — простіше в заміні старих батарей. Підкажемо, що підійде вам." },
];

export default function Pidbir() {
  return (
    <>
      <PageHero eyebrow="Калькулятор" title={<>Скільки тепла <em>потрібно кімнаті</em></>} lead="Розрахунок за об’ємом приміщення (41 Вт на м³) з поправками на тип кімнати, стіни й вікна. Це орієнтир — точний тепловий розрахунок наш інженер зробить безкоштовно." crumbs={[{ href: "/pidbir", label: "Підбір потужності" }]} />
      <section className="section-tight">
        <div className="container">
          <Calc cards={allCards().filter((c) => c.w)} />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Поради інженера" title={<>Що варто <em>врахувати</em></>} />
          <ol className="how">
            {TIPS.map((x, i) => (
              <li key={x.t} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span>0{i + 1}</span>
                <b>{x.t}</b>
                <p>{x.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
