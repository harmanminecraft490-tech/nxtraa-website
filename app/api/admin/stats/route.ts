import { NextResponse } from "next/server";

import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [productCount, orderCount, userCount] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
    ]);

    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      productCount,
      orderCount,
      userCount,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
    });
  } catch (error) {
    console.error("Failed to load admin stats", error);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
