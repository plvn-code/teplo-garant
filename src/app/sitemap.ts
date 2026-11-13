import type { MetadataRoute } from "next";
import { brands, posts, products, sections } from "@/lib/catalog";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/katalog", "/akcii", "/brendy", "/pidbir", "/pro-nas", "/dostavka", "/kontakty", "/blog"].map((p) => ({ url: `${site.url}${p}`, priority: p ? 0.8 : 1 }));
  return [
    ...pages,
    ...sections.map((s) => ({ url: `${site.url}/katalog/${s.id}`, priority: 0.8 })),
    ...brands.map((b) => ({ url: `${site.url}/brendy/${b.id}`, priority: 0.6 })),
    ...products.map((p) => ({ url: `${site.url}/tovar/${p.slug}`, priority: p.popular ? 0.7 : 0.5 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, priority: 0.4 })),
  ];
}
