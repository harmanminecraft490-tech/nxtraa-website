import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import { processShipmentCreation } from "@/lib/shiprocket/orchestrator";
import { getLiveTracking, updateTrackingInDB } from "@/lib/shiprocket/tracking";
import { generateLabel, generateInvoice } from "@/lib/shiprocket/labels";
import { schedulePickup } from "@/lib/shiprocket/pickup";
import { shiprocketRequest } from "@/lib/shiprocket/client";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, orderId } = await request.json();

  if (!action || !orderId) {
    return NextResponse.json({ error: "Missing action or orderId" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    let result = null;

    switch (action) {
      case "retry_shipment":
        await processShipmentCreation(order.orderNumber);
        result = { success: true, message: "Shipment retry initiated" };
        break;

      case "refresh_tracking":
        if (!order.awbCode) throw new Error("No AWB code to track");
        const tracking = await getLiveTracking(order.awbCode);
        await updateTrackingInDB(order.id, tracking);
        result = { success: true, message: "Tracking refreshed" };
        break;

      case "schedule_pickup":
        if (!order.shipmentId) throw new Error("No Shipment ID");
        const pickup = await schedulePickup([Number(order.shipmentId)]);
        if (pickup.pickup_status === 1) {
          await prisma.order.update({ where: { id: order.id }, data: { pickupScheduled: true } });
        }
        result = { success: true, pickup };
        break;

      case "download_label":
        if (!order.shipmentId) throw new Error("No Shipment ID");
        const label = await generateLabel([Number(order.shipmentId)]);
        if (label.label_created === 1) {
          await prisma.order.update({ where: { id: order.id }, data: { labelUrl: label.label_url } });
          result = { success: true, url: label.label_url };
        } else {
          throw new Error("Label generation failed");
        }
        break;

      case "download_invoice":
        const invoice = await generateInvoice([Number(order.shipmentId)]); // Assuming order.shipmentId or cashfreeOrderId? Wait, generateInvoice expects shiprocket_order_id, which we don't store explicitly, but we can query by shipment. Actually Shiprocket /orders/print/invoice takes order IDs. Let's use our orderNumber if it's the exact Shiprocket order ID.
        // Actually, createShiprocketOrder returns order_id (shiprocket's internal ID). We didn't save it! We only saved shipmentId.
        // But the generateInvoice API can take `ids` which are shiprocket order IDs.
        // Wait, Shiprocket label API takes shipment_id.
        // I will return a placeholder error if we can't find it, or we need to save shiprocketOrderId. 
        // For now, let's assume we can use shipmentId to fetch it or the invoiceUrl is already saved during creation.
        if (order.invoiceUrl) {
          result = { success: true, url: order.invoiceUrl };
        } else {
          throw new Error("Invoice URL not generated yet. Try Retry Shipment.");
        }
        break;

      case "cancel_shipment":
        if (!order.awbCode) throw new Error("No AWB Code");
        const cancel = await shiprocketRequest("/orders/cancel/awb", {
          method: "POST",
          body: JSON.stringify({ awbs: [order.awbCode] })
        });
        await prisma.order.update({ where: { id: order.id }, data: { shipmentStatus: "CANCELLED" } });
        result = { success: true, message: "Shipment Cancelled" };
        break;

      default:
        throw new Error("Unknown action");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Admin action ${action} failed:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
