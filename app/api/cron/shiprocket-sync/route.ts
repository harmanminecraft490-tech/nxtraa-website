import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getShiprocketToken } from "@/lib/shiprocket/client";
import { processShipmentCreation } from "@/lib/shiprocket/orchestrator";
import { getLiveTracking, updateTrackingInDB } from "@/lib/shiprocket/tracking";

// This runs via Vercel Cron
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  // Simple cron secret validation
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: any = {
    retried_shipments: 0,
    tracking_updates: 0,
    token_refreshed: false,
    errors: []
  };

  try {
    // 1. Refresh Authentication Token
    await getShiprocketToken();
    results.token_refreshed = true;

    // 2. Retry failed shipment creations
    // Or process anything stuck in PAID without a shipment (e.g. if the queue dropped it)
    const failedOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        OR: [
          { shipmentStatus: "FAILED" },
          { shipmentStatus: null }, 
          // Assuming PENDING shipmentStatus is not fully modeled, we can check for null shipmentId
          { shipmentId: null }
        ],
        shipmentRetryCount: {
          lt: 5 // Stop retrying after 5 attempts
        }
      },
      take: 20 // Process in small batches to avoid timeouts
    });

    for (const order of failedOrders) {
      try {
         await processShipmentCreation(order.orderNumber);
         results.retried_shipments++;
      } catch (err: any) {
         results.errors.push(`Retry failed for ${order.orderNumber}: ${err.message}`);
      }
    }

    // 3. Refresh Tracking for IN_TRANSIT shipments
    const inTransitShipments = await prisma.order.findMany({
      where: {
        shipmentId: { not: null },
        awbCode: { not: null },
        shipmentStatus: { notIn: ["DELIVERED", "CANCELLED", "RTO", "FAILED"] },
        // Only refresh if not updated in the last 6 hours to save API calls
        lastTrackingUpdate: {
          lt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      },
      take: 20
    });

    for (const shipment of inTransitShipments) {
       try {
         if (shipment.awbCode) {
           const trackingData = await getLiveTracking(shipment.awbCode);
           await updateTrackingInDB(shipment.id, trackingData);
           results.tracking_updates++;
         }
       } catch (err: any) {
         results.errors.push(`Tracking refresh failed for ${shipment.orderNumber}: ${err.message}`);
       }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message, results }, { status: 500 });
  }
}
