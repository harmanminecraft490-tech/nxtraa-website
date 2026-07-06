import { NextResponse } from "next/server";
import { basename, extname, join } from "path";
import { mkdir, writeFile } from "fs/promises";
import { getSessionUser, isAdminEmail } from "@/lib/auth/session";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

/** Reduce an arbitrary upload name to a safe slug, discarding any path parts. */
function safeStem(name: string): string {
  const stem = basename(name, extname(name));
  const slug = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "image";
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const file = data.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a JPG, PNG, WebP, GIF, or AVIF image." },
      { status: 415 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5 MB." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadDir = join(process.cwd(), "public/uploads");
  // Filename is fully derived — never trust the client-supplied path.
  const filename = `${Date.now()}-${safeStem(file.name)}${extension}`;
  const path = join(uploadDir, filename);

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path, buffer);
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ error: "Failed to save file." }, { status: 500 });
  }
}