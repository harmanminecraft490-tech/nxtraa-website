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

    const [totalRevenue, paidRevenue, pendingRevenue] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "PENDING" },
        _sum: { total: true },
      }),
    ]);

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

    // Payment status breakdown
    const paymentStatusCounts = await prisma.order.groupBy({
      by: ["paymentStatus"],
      _count: true,
    });

    return NextResponse.json({
      productCount,
      orderCount,
      userCount,
      totalRevenue: totalRevenue._sum.total || 0,
      paidRevenue: paidRevenue._sum.total || 0,
      pendingRevenue: pendingRevenue._sum.total || 0,
      recentOrders,
      paymentStatusCounts: paymentStatusCounts.reduce(
        (acc, item) => {
          acc[item.paymentStatus] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    });
  } catch (error) {
    console.error("Failed to load admin stats", error);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
