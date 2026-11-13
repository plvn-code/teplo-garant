import type { Metadata } from "next";
import { CallbackButton } from "@/components/Callback";
import { Icon, type IconName } from "@/components/Icons";
import { PageHero, SectionHead } from "@/components/Shared";
import { delivery, payment, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Доставка, оплата, обмін і повернення",
  description: "Доставка радіаторів і рушникосушок по Україні за 1–3 дні: Нова пошта, SAT, Delivery, власне авто по Львову, самовивіз зі складу в Наварії. Оплата готівкою або за реквізитами. Повернення 14 днів.",
  alternates: { canonical: "/dostavka" },
};

const ICONS: Record<string, IconName> = { np: "truck", courier: "home", pickup: "pin", cod: "card", invoice: "doc" };

const STEPS = [
  { t: "Замовлення", d: "Оформіть на сайті, купіть в один клік або зателефонуйте — менеджер усе запише сам." },
  { t: "Підтвердження", d: "Уточнимо наявність, розміри, сторону підключення й колір, надішлемо рахунок." },
  { t: "Аванс або оплата", d: "Відправлення перевізником — після авансу 10% або повної оплати. Самовивіз — оплата на місці." },
  { t: "Отримання", d: "1–3 дні по Україні, 1–2 дні по Львову. Перевірте упаковку й комплектність під час отримання." },
];

const FAQ = [
  { q: "Скільки коштує доставка?", a: "Доставка перевізниками — за тарифами Нової пошти, SAT чи Delivery. Доставка нашим авто по Львову до під’їзду — у середньому 600 ₴. Самовивіз зі складу безкоштовний." },
  { q: "Чому потрібен аванс?", a: "Радіатори — великогабаритний товар, тож відправляємо перевізником після авансу 10% від суми замовлення або повної оплати на розрахунковий рахунок." },
  { q: "Можна оплатити на рахунок компанії?", a: "Так. Оплата за реквізитами або безготівковим перерахунком — для приватних клієнтів і будівельних компаній." },
  { q: "Що робити, якщо радіатор пошкоджений у дорозі?", a: "Огляньте упаковку у відділенні перевізника. Якщо є пошкодження — складіть акт із працівником і зателефонуйте нам, вирішимо питання з перевізником." },
  { q: "Чи є монтаж?", a: "Підкажемо схему підключення, комплектуючі й порекомендуємо перевірених майстрів. Питайте менеджера під час замовлення." },
];

export default function Delivery() {
  return (
    <>
      <PageHero eyebrow="Покупцям" title={<>Доставка <em>й оплата</em></>} lead="Привеземо по Львову нашим авто, відправимо по Україні перевізниками або підготуємо замовлення до самовивозу зі складу за 10 км від Львова." crumbs={[{ href: "/dostavka", label: "Доставка й оплата" }]} />

      <section className="section-tight">
        <div className="container">
          <p className="eyebrow">Доставка</p>
          <div className="ship-cards">
            {delivery.map((d, i) => (
              <div className="ship-card spot" key={d.id} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="perk-icon">
                  <Icon name={ICONS[d.id]} size={26} stroke={1.4} />
                </span>
                <b>{d.title}</b>
                <p>{d.note}</p>
              </div>
            ))}
          </div>
          <p className="eyebrow" style={{ marginTop: 48 }}>
            Оплата
          </p>
          <div className="ship-cards">
            {payment.map((d, i) => (
              <div className="ship-card spot" key={d.id} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="perk-icon">
                  <Icon name={ICONS[d.id]} size={26} stroke={1.4} />
                </span>
                <b>{d.title}</b>
                <p>{d.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Як це працює" title={<>Від замовлення <em>до тепла</em></>} />
          <ol className="how">
            {STEPS.map((x, i) => (
              <li key={x.t} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span>0{i + 1}</span>
                <b>{x.t}</b>
                <p>{x.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-light" id="povernennia">
        <div className="container faq-grid">
          <div>
            <p className="eyebrow">Обмін і повернення</p>
            <h2 className="display-md">
              14 днів <em>на рішення</em>
            </h2>
            <p className="section-lead">
              Відповідно до Закону України «Про захист прав споживачів» товар належної якості можна обміняти або повернути протягом 14 днів, не рахуючи дня покупки.
            </p>
          </div>
          <div className="rich">
            <h3>Товар належної якості</h3>
            <ul>
              <li>не використовувався й не встановлювався;</li>
              <li>збережено товарний вигляд, споживчі властивості, пломби та ярлики;</li>
              <li>є розрахунковий документ, виданий разом із товаром.</li>
            </ul>
            <h3>Товар неналежної якості</h3>
            <p>Якщо протягом гарантійного строку виявлено недолік, ви маєте право на його безоплатне усунення в розумний строк. Вимоги не задовольняються, якщо недолік виник через порушення правил монтажу, користування чи зберігання.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container faq-grid">
          <div>
            <p className="eyebrow">Питання</p>
            <h2 className="display-md">
              Часті <em>запитання</em>
            </h2>
            <p className="section-lead">Не знайшли відповідь? Зателефонуйте {site.phone} або залиште номер.</p>
            <div className="band-actions">
              <CallbackButton className="btn btn-lg btn-glow">Передзвоніть мені</CallbackButton>
            </div>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <Icon name="plus" size={20} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
