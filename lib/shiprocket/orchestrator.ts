import prisma from "@/lib/prisma";
import { createShiprocketOrder } from "./orders";
import { getAvailableCouriers, assignBestCourier } from "./couriers";
import { generateLabel, generateInvoice } from "./labels";
import { schedulePickup } from "./pickup";

export async function processShipmentCreation(orderNumber: string) {
  let order = await prisma.order.findUnique({ where: { orderNumber } });
  
  if (!order) {
    throw new Error(`Order ${orderNumber} not found in database.`);
  }

  const logEvent = async (action: string, status: string = "INFO", details?: any, error?: any) => {
    console.log(`[Shiprocket] [${orderNumber}] ${action} - ${status}`);
    if (error) console.error(`[Shiprocket] [${orderNumber}] ERROR:`, error);
    
    await prisma.shipmentLog.create({
      data: { 
        orderId: order!.id, 
        action, 
        status,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
        error: error ? (error instanceof Error ? error.stack || error.message : JSON.stringify(error)) : null
      }
    });
  };

  await logEvent("Shipment Creation Started");

  try {
    // 1. Create Order in Shiprocket
    await logEvent("Shipment Request");
    const orderResponse = await createShiprocketOrder(orderNumber);
    await logEvent("Shipment Response", "SUCCESS", orderResponse);
    
    const shiprocketOrderId = orderResponse.order_id;
    const shipmentId = orderResponse.shipment_id;

    if (!shiprocketOrderId || !shipmentId) {
      throw new Error(`Invalid response from Shiprocket order creation: ${JSON.stringify(orderResponse)}`);
    }

    // Update DB with initial IDs
    order = await prisma.order.update({
      where: { id: order.id },
      data: {
        shipmentId: shipmentId.toString(),
        shipmentStatus: "CREATED",
        shipmentCreatedAt: new Date(),
      }
    });

    // 2. Fetch Available Couriers
    await logEvent("Courier Fetch Request");
    const pickupPostcode = "110001"; // TODO: Should come from settings
    const deliveryPostcode = order.pincode;
    
    const couriers = await getAvailableCouriers(pickupPostcode, deliveryPostcode, 0.5, 0);
    
    if (!couriers || couriers.length === 0) {
      throw new Error("No couriers available for this pincode.");
    }
    await logEvent("Courier Fetch Response", "SUCCESS", { count: couriers.length });

    // 3. Assign Best Courier and Generate AWB
    await logEvent("Courier Assignment Request");
    const assignResponse = await assignBestCourier(shipmentId, couriers);
    const awb = assignResponse.response?.data?.awb_code;
    const courierName = assignResponse.bestCourier?.courier_name;
    const courierCompanyId = assignResponse.bestCourier?.courier_company_id;
    const shippingCharges = assignResponse.bestCourier?.rate;
    const etd = assignResponse.bestCourier?.etd;

    if (!awb) {
       throw new Error(`Failed to generate AWB: ${JSON.stringify(assignResponse)}`);
    }

    await logEvent("Courier Assigned & AWB Generated", "SUCCESS", { awb, courierName, shippingCharges, etd });

    // 4. Generate Label
    await logEvent("Label Generation Request");
    const labelResponse = await generateLabel([shipmentId]);
    const labelUrl = labelResponse.label_created === 1 ? labelResponse.label_url : null;
    await logEvent("Label Generation Response", "SUCCESS", { labelUrl });

    // 5. Generate Invoice
    await logEvent("Invoice Generation Request");
    const invoiceResponse = await generateInvoice([shiprocketOrderId]);
    const invoiceUrl = invoiceResponse.is_invoice_created ? invoiceResponse.invoice_url : null;
    await logEvent("Invoice Generation Response", "SUCCESS", { invoiceUrl });

    // 6. Schedule Pickup
    await logEvent("Pickup Scheduling Request");
    const pickupResponse = await schedulePickup([shipmentId]);
    const pickupScheduled = pickupResponse.pickup_status === 1;
    await logEvent("Pickup Scheduling Response", "SUCCESS", pickupResponse);

    // 7. Save Everything to DB
    await prisma.order.update({
      where: { id: order.id },
      data: {
        awbCode: awb,
        trackingNumber: awb,
        trackingUrl: `https://shiprocket.co/tracking/${awb}`,
        courierName: courierName,
        courierCompany: courierCompanyId?.toString(),
        shippingCharges: Math.round(parseFloat(shippingCharges) * 100),
        labelUrl: labelUrl,
        invoiceUrl: invoiceUrl,
        pickupScheduled: pickupScheduled,
        shipmentStatus: "READY_TO_SHIP",
        estimatedDelivery: etd ? new Date(etd) : undefined,
      }
    });

    await logEvent("Shipment Creation Completed Successfully", "SUCCESS");

  } catch (error: any) {
    await logEvent("Shipment Creation Failed", "FAILED", null, error);

    // Increment retry count
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shipmentStatus: "FAILED",
        shipmentRetryCount: { increment: 1 }
      }
    });

    throw error;
  }
}
