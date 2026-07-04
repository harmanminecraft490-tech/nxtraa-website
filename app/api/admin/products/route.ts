import { NextResponse } from "next/server";

import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

type ProductUpdatePayload = {
  title?: string;
  model?: string;
  price?: number;
  oldPrice?: number;
  rating?: number;
  badge?: string;
  category?: string;
  color?: string;
  description?: string;
  highlights?: string[];
  imageUrls?: string[];
};

const pickProductUpdates = (updates: unknown): ProductUpdatePayload => {
  if (!updates || typeof updates !== "object") return {};

  const u = updates as Record<string, unknown>;
  const data: ProductUpdatePayload = {};

  if (typeof u.title === "string") data.title = u.title;
  if (typeof u.model === "string") data.model = u.model;
  if (typeof u.price === "number") data.price = u.price;
  if (typeof u.oldPrice === "number") data.oldPrice = u.oldPrice;
  if (typeof u.rating === "number") data.rating = u.rating;
  if (typeof u.badge === "string") data.badge = u.badge;
  if (typeof u.category === "string") data.category = u.category;
  if (typeof u.color === "string") data.color = u.color;
  if (typeof u.description === "string") data.description = u.description;
  if (Array.isArray(u.highlights) && u.highlights.every((x) => typeof x === "string")) {
    data.highlights = u.highlights as string[];
  }
  if (Array.isArray(u.imageUrls) && u.imageUrls.every((x) => typeof x === "string")) {
    data.imageUrls = u.imageUrls as string[];
  }

  return data;
};

export async function GET() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to load products", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const data = pickProductUpdates(updates);

    const updated = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Product update failed (admin products route):", error);
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

