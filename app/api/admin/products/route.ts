import { NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

const PRODUCTS_DATA_PATH = path.join(process.cwd(), "app/components/lib/products-data.json");

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = fs.readFileSync(PRODUCTS_DATA_PATH, "utf-8");
    const products = JSON.parse(data);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const data = fs.readFileSync(PRODUCTS_DATA_PATH, "utf-8");
    const products = JSON.parse(data);

    const productIndex = products.findIndex((p: { id: number }) => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    products[productIndex] = { ...products[productIndex], ...updates };

    fs.writeFileSync(PRODUCTS_DATA_PATH, JSON.stringify(products, null, 2));

    return NextResponse.json({ success: true, product: products[productIndex] });
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
