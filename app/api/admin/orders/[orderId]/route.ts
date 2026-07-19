import { NextRequest, NextResponse } from "next/server";

import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

type RouteParams = {
  params: Promise<{
    orderId: string;
  }>;
};

/**
 * GET /api/admin/orders/:orderId
 * Returns full order details for the admin panel.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Enrich with product details
    const productIds = order.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, price: true, imageUrls: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const enrichedOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: productMap.get(item.productId) || null,
      })),
    };

    return NextResponse.json({ order: enrichedOrder });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders/:orderId
 * Updates order delivery status.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;
  const body = await request.json();

  const validStatuses: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"];
  const newStatus = body.status as OrderStatus;

  if (!newStatus || !validStatuses.includes(newStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
