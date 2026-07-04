import { NextResponse } from "next/server";

import fs from "fs";
import path from "path";

import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public/products");
const MAX_IMAGES = 3;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file || !productId) {
      return NextResponse.json({ error: "File and productId are required" }, { status: 400 });
    }

    const productIdNumber = Number(productId);
    if (!Number.isFinite(productIdNumber)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productIdNumber },
      select: { id: true, imageUrls: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentImages = product.imageUrls ?? [];
    if (currentImages.length >= MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images allowed per product` },
        { status: 400 },
      );
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".png";

    // Unique filename
    const timestamp = Date.now();
    const fileName = `product-${productIdNumber}-${timestamp}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Upload image bytes
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/products/${fileName}`;
    const updatedImages = [...currentImages, imageUrl];

    await prisma.product.update({
      where: { id: productIdNumber },
      data: { imageUrls: updatedImages },
    });

    return NextResponse.json({ success: true, imageUrl, imageUrls: updatedImages });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

