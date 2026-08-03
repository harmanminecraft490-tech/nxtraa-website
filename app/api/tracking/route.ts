import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: id },
          { awbCode: id }
        ]
      },
      select: {
        orderNumber: true,
        createdAt: true,
        status: true,
        shipmentStatus: true,
        awbCode: true,
        courierName: true,
        estimatedDelivery: true,
        shipmentResponse: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Attempt to extract tracking activities from shipmentResponse
    let trackingActivities = [];
    if (order.shipmentResponse && typeof order.shipmentResponse === 'object') {
      const sr = order.shipmentResponse as any;
      if (sr.tracking_data && sr.tracking_data.track_status === 1) {
         trackingActivities = sr.tracking_data.shipment_track_activities || [];
      } else if (sr.scans) { // webhook format
         trackingActivities = sr.scans.map((scan: any) => ({
           activity: scan.activity,
           location: scan.location,
           date: scan.date
         }));
      }
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.shipmentStatus || order.status,
      awbCode: order.awbCode,
      courierName: order.courierName,
      estimatedDelivery: order.estimatedDelivery,
      trackingActivities
    });
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
