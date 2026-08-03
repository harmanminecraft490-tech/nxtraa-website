import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processShipmentCreation } from "@/lib/shiprocket/orchestrator";
import { getShiprocketToken } from "@/lib/shiprocket/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      return NextResponse.json({ error: "Missing orderNumber parameter. Usage: /api/debug/shiprocket?orderNumber=YOUR_ORDER" }, { status: 400 });
    }

    // 1. Verify Shiprocket Authentication First
    let authSuccess = false;
    try {
      const token = await getShiprocketToken();
      authSuccess = !!token;
    } catch (e: any) {
      return NextResponse.json({ 
        step: "Authentication", 
        status: "FAILED", 
        error: e.message 
      }, { status: 500 });
    }

    // 2. Execute processShipmentCreation synchronously so we can return the result
    try {
      await processShipmentCreation(orderNumber);
    } catch (e: any) {
      // Don't return immediately, we want to see the logs even on failure
      console.error("[Debug Endpoint] Error:", e);
    }

    // 3. Fetch the logs generated during this run
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) {
       return NextResponse.json({ error: "Order disappeared" }, { status: 404 });
    }

    const logs = await prisma.shipmentLog.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({
      status: order.shipmentStatus,
      authSuccess,
      trackingUrl: order.trackingUrl,
      awb: order.awbCode,
      courier: order.courierName,
      logs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
