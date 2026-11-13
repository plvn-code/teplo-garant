import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import { CallbackModal } from "@/components/Callback";
import { CartDrawer } from "@/components/CartDrawer";
import { CursorLabel } from "@/components/CursorLabel";
import { Effects } from "@/components/Effects";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Intro } from "@/components/Intro";
import { MobileBar } from "@/components/MobileBar";
import { SearchOverlay } from "@/components/SearchOverlay";
import { brands, products, sections } from "@/lib/catalog";
import { CartProvider } from "@/lib/cart";
import { site } from "@/lib/site";
import "./globals.css";

const display = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["300", "400", "500", "600"], variable: "--font-display", display: "swap" });
const body = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Teplogarant — дизайнерські радіатори та рушникосушки", template: "%s — Teplogarant" },
  description: site.description,
  openGraph: { type: "website", locale: "uk_UA", siteName: "Teplogarant", images: ["/images/p/9957-3.webp"] },
  // The redesign stays out of search until the client approves the launch.
  robots: process.env.NEXT_PUBLIC_SITE_LIVE === "1" ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#05070f", colorScheme: "dark" };

/** Interior shot shown in the mega menu next to each section (product id + photo index). */
const SECTION_ART: Record<string, string> = {
  "dyzainerski-radiatory": "9957-3", "stalevi-radiatory": "8975-1", "elektrychni-radiatory": "8267-1", "dyzainerski-rushnykosushky": "12655-3",
  "vodiani-rushnykosushky": "", "elektrychni-rushnykosushky": "", teny: "", krany: "9321-2", trymachi: "",
};

const store = {
  "@context": "https://schema.org",
  "@type": "HomeGoodsStore",
  name: "Teplogarant — Тепло Гарант",
  url: site.url,
  telephone: "+380989351571",
  email: site.email,
  foundingDate: String(site.since),
  address: { "@type": "PostalAddress", streetAddress: "Автошлях Т1416", addressLocality: "Наварія", addressRegion: "Львівська область", addressCountry: "UA" },
  openingHours: ["Mo-Fr 09:00-18:00", "Sa 09:00-14:00"],
  sameAs: site.socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
};

/** Runs before paint: the intro shows once per session, only on the home page, never with reduced motion. */
const introScript = `try{var d=document.documentElement;if(sessionStorage.getItem('tg-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches||location.pathname!=='/'){d.classList.add('no-intro')}sessionStorage.setItem('tg-intro','1')}catch(e){document.documentElement.classList.add('no-intro')}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const menu = sections.map((s) => ({ id: s.id, name: s.name, count: s.count, subs: s.subs.map(({ id, name }) => ({ id, name })), art: SECTION_ART[s.id] ? `/images/p/${SECTION_ART[s.id]}.webp` : undefined }));
  const top = brands.slice(0, 9).map(({ id, name }) => ({ id, name }));
  return (
    <html lang="uk" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Перейти до змісту
        </a>
        <CartProvider>
          <Intro />
          <Header sections={menu} brands={top} total={products.length} />
          <main id="main">{children}</main>
          <Footer />
          <MobileBar />
          <SearchOverlay />
          <CartDrawer />
          <CallbackModal />
        </CartProvider>
        <CursorLabel />
        <Effects />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(store) }} />
      </body>
    </html>
  );
}
