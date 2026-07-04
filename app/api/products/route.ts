import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
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

