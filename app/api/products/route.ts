import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PRODUCTS_DATA_PATH = path.join(process.cwd(), "app/components/lib/products-data.json");

export async function GET() {
  try {
    const data = fs.readFileSync(PRODUCTS_DATA_PATH, "utf-8");
    const products = JSON.parse(data);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
