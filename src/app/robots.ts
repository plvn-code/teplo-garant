import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const live = process.env.NEXT_PUBLIC_SITE_LIVE === "1";
  return { rules: live ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" }, sitemap: `${site.url}/sitemap.xml` };
}
