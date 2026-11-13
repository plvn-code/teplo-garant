import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/Shared";
import { posts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Поради: як обрати радіатор і рушникосушку",
  description: "Статті Teplogarant: як вибрати радіатор опалення, схеми підключення, дизайнерські радіатори в інтер’єрі, рушникосушки, догляд і монтаж.",
  alternates: { canonical: "/blog" },
};

export default function Blog() {
  const list = [...posts].sort((a, b) => Number(b.cover) - Number(a.cover));
  return (
    <>
      <PageHero eyebrow={`${posts.length} статей`} title={<>Розбираємося <em>в теплі</em></>} lead="Як вибрати радіатор і рушникосушку, як підключити й доглядати — практичні поради від команди Тепло Гарант." crumbs={[{ href: "/blog", label: "Поради" }]} />
      <section className="section-tight">
        <div className="container posts posts-all">
          {list.map((p, i) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="post" data-reveal style={{ ["--d" as string]: `${(i % 3) * 0.06}s` }} data-cursor="Читати">
              <span className="post-img">{p.cover ? <img src={`/images/blog/${p.slug}.webp`} alt="" loading={i < 6 ? "eager" : "lazy"} /> : null}</span>
              <small>{p.mins} хв читання</small>
              <b>{p.title}</b>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
