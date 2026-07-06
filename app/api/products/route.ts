import { NextResponse } from "next/server";

import { getAllProductsCached } from "@/app/components/lib/products-cache";

export async function GET() {
  // Shared, TTL-backed cache. getAllProductsCached already swallows database
  // errors and returns [] so the storefront degrades gracefully.
  const products = await getAllProductsCached();
  return NextResponse.json(products);
}

