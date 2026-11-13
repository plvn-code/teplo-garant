import type { NextConfig } from "next";
import data from "./src/data/catalog.json";

/** Fonts and images are self-hosted, so the policy only allows our own origin. */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

/**
 * Old teplogarant.in.ua (OpenCart) addresses → new pages, so Google rankings and shared links survive the domain switch.
 * Products lived at /<slug>/ and /ru/<slug>/, categories at /<old-slug>/…, brands at /<brand>/.
 */
const permanent = (source: string, destination: string) => ({ source, destination, permanent: true });
type S = { id: string; old: string };
const sections = data.sections as S[];
const products = data.products as { slug: string; oldSlug: string }[];
const blog = data.blog as { slug: string }[];
const BRANDS: Record<string, string> = {
  irsap: "irsap", zehnder: "zehnder", vasco: "vasco", stelrad: "stelrad", quinn: "quinn", "purmo-group": "purmo", radson: "radson", terma: "terma",
  mario: "mario", "vario-term": "vario-term", komex: "komex", belrad: "belrad", "hybro-technologies": "hybro", raftec: "raftec", "instal-projekt": "instal-projekt",
};
const PAGES: Record<string, string> = {
  "about-us": "/pro-nas", shipping: "/dostavka", "refund-policy": "/dostavka#povernennia", "contact-us": "/kontakty", reviews: "/pro-nas",
  sale: "/akcii", specials: "/akcii", manufacturer: "/brendy", "terms-and-conditions": "/dostavka", "privacy-policy": "/dostavka", simplecheckout: "/koshyk",
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
  async redirects() {
    const out = [
      ...products.flatMap((p) => [p.oldSlug, encodeURI(p.oldSlug)].filter((x, i, a) => a.indexOf(x) === i).flatMap((o) => [permanent(`/${o}`, `/tovar/${p.slug}`), permanent(`/ru/${o}`, `/tovar/${p.slug}`)])),
      ...sections.flatMap((s) => [permanent(`/${s.old}`, `/katalog/${s.id}`), permanent(`/${s.old}/:rest*`, `/katalog/${s.id}`), permanent(`/ru/${s.old}/:rest*`, `/katalog/${s.id}`)]),
      ...Object.entries(BRANDS).flatMap(([o, n]) => [permanent(`/${o}`, `/brendy/${n}`), permanent(`/ru/${o}`, `/brendy/${n}`)]),
      ...Object.entries(PAGES).flatMap(([o, n]) => [permanent(`/${o}`, n), permanent(`/ru/${o}`, n)]),
      ...blog.map((b) => permanent(`/ru/blog/${b.slug}`, `/blog/${b.slug}`)),
      permanent("/ru", "/"),
      permanent("/ru/blog", "/blog"),
    ];
    return out;
  },
};

export default nextConfig;
