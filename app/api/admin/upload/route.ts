import { NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

const PRODUCTS_DATA_PATH = path.join(process.cwd(), "app/components/lib/products-data.json");
const UPLOAD_DIR = path.join(process.cwd(), "public/products");
const MAX_IMAGES = 3;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file || !productId) {
      return NextResponse.json({ error: "File and productId are required" }, { status: 400 });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".png";
    
    // Read current products data
    const data = fs.readFileSync(PRODUCTS_DATA_PATH, "utf-8");
    const products = JSON.parse(data);

    const productIndex = products.findIndex((p: { id: number; imageUrls: string[] }) => p.id === Number(productId));
    if (productIndex === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentImages = products[productIndex].imageUrls || [];
    
    // Check if we've reached the max number of images
    if (currentImages.length >= MAX_IMAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_IMAGES} images allowed per product` }, { status: 400 });
    }

    // Generate unique filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const fileName = `product-${productId}-${timestamp}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/products/${fileName}`;
    
    // Add new image to the array
    const updatedImages = [...currentImages, imageUrl];
    products[productIndex].imageUrls = updatedImages;

    fs.writeFileSync(PRODUCTS_DATA_PATH, JSON.stringify(products, null, 2));

    return NextResponse.json({ success: true, imageUrl, imageUrls: updatedImages });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
