import { NextResponse } from "next/server";

import { getAllProductsCached } from "@/app/components/lib/products-cache";

// Always reflect the live catalog — never let Next serve a statically cached
// response, or admin edits would not appear until a redeploy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Shared, TTL-backed cache. getAllProductsCached already swallows database
  // errors and returns [] so the storefront degrades gracefully.
  const products = await getAllProductsCached();
  return NextResponse.json(products, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

