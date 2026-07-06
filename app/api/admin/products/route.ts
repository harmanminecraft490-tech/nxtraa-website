import { NextResponse } from "next/server";

import { Prisma } from "@prisma/client";
import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { invalidateProductsCache } from "@/app/components/lib/products-cache";

type ProductUpdatePayload = {
  id?: number;
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

const pickProductUpdates = <T extends ProductUpdatePayload>(
  updates: unknown,
): Partial<T> => {
  if (!updates || typeof updates !== "object") return {} as Partial<T>;

  const u = updates as Record<string, unknown>;
  const data: Partial<T> = {};

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

  return data as Partial<T>;
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

    return NextResponse.json(products as ProductUpdatePayload[]);
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

    // If id is provided, update existing product
    if (id) {
      const productId = Number(id);
      if (!Number.isFinite(productId)) {
        return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
      }

      const data = pickProductUpdates(updates);

      const updated = await prisma.product.update({
        where: { id: productId },
        data,
      });

      // Invalidate cache to reflect changes
      invalidateProductsCache();

      return NextResponse.json({ success: true, product: updated });
    }

    // Otherwise, create new product
    const data = pickProductUpdates(updates);

    // Validate required fields for creation
    if (!data.title || !data.model || !data.price || !data.category) {
      return NextResponse.json(
        { error: "Title, model, price, and category are required for new products." },
        { status: 400 },
      );
    }

    const { title, model, price, category, ...rest } = data;

    const created = await prisma.product.create({
      data: {
        title,
        model,
        price,
        category,
        oldPrice: rest.oldPrice ?? price,
        rating: rest.rating ?? 0,
        badge: rest.badge ?? "",
        color: rest.color ?? "",
        description: rest.description ?? "",
        highlights: rest.highlights ?? [],
        imageUrls: rest.imageUrls ?? [],
      },
    });

    // Invalidate cache to reflect changes
    invalidateProductsCache();

    return NextResponse.json({ success: true, product: created });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: Record to update not found
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
    }
    console.error("Product save failed:", error);
    return NextResponse.json(
      {
        error: "Failed to save product",
        details: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    // Invalidate cache to reflect changes
    invalidateProductsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: Record to delete not found
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
    }
    console.error("Product deletion failed:", error);
    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
