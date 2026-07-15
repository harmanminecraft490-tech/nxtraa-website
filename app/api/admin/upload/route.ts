import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSessionUser, isAdminEmail } from "@/lib/auth/session";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function safeFilename(name: string) {
  const ext = name.includes(".") ? name.substring(name.lastIndexOf(".")) : "";
  const base = name.replace(ext, "");

  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${Date.now()}-${slug || "image"}${ext.toLowerCase()}`;
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: "Only JPG, PNG, WEBP, GIF and AVIF images are allowed.",
        },
        { status: 415 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Maximum upload size is 5MB.",
        },
        { status: 413 }
      );
    }

    const blob = await put(
      safeFilename(file.name),
      file,
      {
        access: "public",
        addRandomSuffix: true,
      }
    );

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (err) {
    console.error("Upload failed:", err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}