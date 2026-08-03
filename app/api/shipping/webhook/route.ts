import { NextResponse } from "next/server";
import { verifyShiprocketWebhook } from "@/lib/shiprocket/webhooks";
import prisma from "@/lib/prisma";
import { updateTrackingInDB } from "@/lib/shiprocket/tracking";

export async function POST(request: Request) {
  const signature = request.headers.get("x-api-key");
  const rawBody = await request.text();

  if (!verifyShiprocketWebhook(signature, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);

    const awb = payload.awb;
    const currentStatus = payload.current_status;
    const orderId = payload.order_id; // Usually Shiprocket order_id, which we map to our orderNumber

    if (!orderId && !awb) {
      return NextResponse.json({ received: true });
    }

    // Find our order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderId },
          { awbCode: awb }
        ]
      }
    });

    if (!order) {
      return NextResponse.json({ received: true, note: "Order not found" });
    }

    // Map webhook payload to our tracking DB struct
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shipmentStatus: currentStatus,
        lastTrackingUpdate: new Date(),
        // Just storing latest webhook info
        shipmentResponse: payload,
      }
    });

    await prisma.shipmentLog.create({
      data: {
        orderId: order.id,
        action: `Webhook Received: ${currentStatus}`,
        status: currentStatus,
        details: payload
      }
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
