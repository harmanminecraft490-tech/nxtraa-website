import { NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocket/client";
import prisma from "@/lib/prisma";

export async function GET() {
  const health: any = {
    status: "ok",
    shiprocketAuth: false,
    database: false,
    pendingShipments: 0,
    failedShipments: 0
  };

  try {
    // Check DB
    const failedCount = await prisma.order.count({ where: { shipmentStatus: "FAILED" } });
    const pendingCount = await prisma.order.count({ where: { paymentStatus: "PAID", shipmentId: null } });
    
    health.database = true;
    health.pendingShipments = pendingCount;
    health.failedShipments = failedCount;

    // Check Shiprocket Auth
    await getShiprocketToken();
    health.shiprocketAuth = true;

  } catch (error: any) {
    health.status = "degraded";
    health.error = error.message;
  }

  return NextResponse.json(health, { status: health.status === "ok" ? 200 : 503 });
}
