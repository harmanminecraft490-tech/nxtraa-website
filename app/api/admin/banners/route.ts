import { NextResponse } from "next/server";
import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { siteBanners } from "@/app/components/lib/banners";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });

    // Auto-seed default banners into DB if none exist
    if (banners.length === 0) {
      const seeded = await Promise.all(
        siteBanners.map((b, i) =>
          prisma.banner.create({
            data: { src: b.src, href: b.href, alt: b.alt, order: i },
          })
        )
      );
      banners = seeded;
    }

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Failed to load banners", error);
    return NextResponse.json({ error: "Failed to load banners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, src, href, alt, order } = body;

    // Update existing
    if (id) {
      const updated = await prisma.banner.update({
        where: { id: Number(id) },
        data: {
          src,
          href,
          alt,
          order: typeof order === "number" ? order : 0,
        },
      });
      return NextResponse.json({ success: true, banner: updated });
    }

    // Create new
    if (!src) {
      return NextResponse.json({ error: "Image source is required" }, { status: 400 });
    }

    const created = await prisma.banner.create({
      data: {
        src,
        href: href || "/",
        alt: alt || "Banner",
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json({ success: true, banner: created });
  } catch (error) {
    console.error("Banner save failed:", error);
    return NextResponse.json(
      { error: "Failed to save banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
    }

    await prisma.banner.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Banner deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
