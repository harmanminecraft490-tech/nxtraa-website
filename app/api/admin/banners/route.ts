import { NextResponse } from "next/server";
import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });

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
    const { id, src, href, alt, order, desktopImageUrl, mobileImageUrl, displayMode } = body;

    const mode = displayMode === "FILL" ? "FILL" : "FIT";

    // Update existing
    if (id) {
      const updated = await prisma.banner.update({
        where: { id: Number(id) },
        data: {
          src,
          href,
          alt,
          order: typeof order === "number" ? order : 0,
          desktopImageUrl: desktopImageUrl ?? undefined,
          mobileImageUrl: mobileImageUrl ?? undefined,
          displayMode: mode,
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
        desktopImageUrl: desktopImageUrl || src,
        mobileImageUrl: mobileImageUrl || null,
        displayMode: mode,
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
