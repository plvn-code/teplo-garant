import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icons";
import { Crumbs } from "@/components/Shared";
import { getPost, posts } from "@/lib/catalog";

export const dynamicParams = false;
export const generateStaticParams = () => posts.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return {};
  const lead = p.desc.find((d) => d[0] === "p")?.[1] ?? "";
  return { title: p.title, description: lead.slice(0, 160), alternates: { canonical: `/blog/${p.slug}` }, openGraph: p.cover ? { images: [`/images/blog/${p.slug}.webp`] } : undefined };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const more = posts.filter((x) => x.slug !== p.slug && x.cover).slice(0, 3);
  const blocks: { kind: "p" | "h" | "ul"; items: string[] }[] = [];
  for (const [k, t] of p.desc) {
    if (k === "li") {
      const last = blocks[blocks.length - 1];
      if (last?.kind === "ul") last.items.push(t);
      else blocks.push({ kind: "ul", items: [t] });
    } else blocks.push({ kind: k === "h" ? "h" : "p", items: [t] });
  }
  return (
    <>
      <article className="article">
        <div className="container article-head">
          <Crumbs items={[{ href: "/blog", label: "Поради" }, { href: `/blog/${p.slug}`, label: p.title }]} />
          <p className="eyebrow fade-up">{p.mins} хв читання</p>
          <h1 className="display-md fade-up">{p.title}</h1>
        </div>
        {p.cover && (
          <div className="container">
            <img className="article-cover fade-up" src={`/images/blog/${p.slug}.webp`} alt="" />
          </div>
        )}
        <div className="container">
          <div className="rich article-body">
            {blocks.map((b, i) =>
              b.kind === "ul" ? (
                <ul key={i}>
                  {b.items.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                </ul>
              ) : b.kind === "h" ? (
                <h3 key={i}>{b.items[0]}</h3>
              ) : (
                <p key={i}>{b.items[0]}</p>
              ),
            )}
          </div>
        </div>
      </article>
      <section className="section-tight">
        <div className="container">
          <div className="section-head">
            <h2 className="display-sm">Читайте також</h2>
            <Link href="/blog" className="link-arrow">
              Усі статті <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="posts">
            {more.map((x) => (
              <Link key={x.slug} href={`/blog/${x.slug}`} className="post">
                <span className="post-img">
                  <img src={`/images/blog/${x.slug}.webp`} alt="" loading="lazy" />
                </span>
                <small>{x.mins} хв читання</small>
                <b>{x.title}</b>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
