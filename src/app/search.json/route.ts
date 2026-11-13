import { NextResponse } from "next/server";
import { products, toCard } from "@/lib/catalog";

/** The whole catalogue as compact cards for the instant search. Built once at build time. */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(products.map(toCard), { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
