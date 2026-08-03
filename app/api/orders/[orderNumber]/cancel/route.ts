import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { cancelShiprocketOrder } from "@/lib/shiprocket/cancel";

type OrderRouteProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export async function POST(_request: Request, { params }: OrderRouteProps) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to cancel your order." }, { status: 401 });
  }

  const { orderNumber } = await params;
  
  const order = await prisma.order.findUnique({
    where: { orderNumber },
  });

  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Prevent cancellation if already shipped/dispatched/delivered
  const uncancelableStatuses = ["shipped", "delivered"];
  if (uncancelableStatuses.includes(order.status)) {
    return NextResponse.json({ error: "Order has already been dispatched and cannot be cancelled." }, { status: 400 });
  }
  
  if (order.shipmentStatus === "SHIPPED" || order.shipmentStatus === "DISPATCHED" || order.shipmentStatus === "DELIVERED") {
    return NextResponse.json({ error: "Order has already been dispatched and cannot be cancelled." }, { status: 400 });
  }
  
  if (order.status === "cancelled") {
    return NextResponse.json({ error: "Order is already cancelled." }, { status: 400 });
  }

  try {
    // 1. Cancel in Shiprocket if it exists there
    let shiprocketOrderId = undefined;
    if (order.shipmentResponse && typeof order.shipmentResponse === 'object' && 'order_id' in (order.shipmentResponse as any)) {
      shiprocketOrderId = (order.shipmentResponse as any).order_id;
    }
    
    // Fallback for orders that might have been saved differently
    if (!shiprocketOrderId && order.shipmentId && !order.awbCode) {
      // If we only have shipmentId and no AWB, we can't reliably cancel via /orders/cancel without order_id
      // But let's try to pass the shipmentId just in case, though the API strictly says order_id.
      // We will skip if we don't have order_id or awbCode to prevent errors
    }

    if (shiprocketOrderId || order.awbCode) {
      await cancelShiprocketOrder(shiprocketOrderId?.toString(), order.awbCode || undefined);
    }

    // 2. Update DB
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "cancelled",
        shipmentStatus: "CANCELLED"
      }
    });

    return NextResponse.json({ success: true, message: "Order cancelled successfully." });
  } catch (error: any) {
    console.error(`[Cancel Order] Failed to cancel order ${orderNumber}:`, error);
    return NextResponse.json({ error: "Failed to cancel order. Please try again or contact support." }, { status: 500 });
  }
}
