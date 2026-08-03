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

  // Log start
  await prisma.shipmentLog.create({
    data: { orderId: order.id, action: "Shipment Creation Started" }
  });

  try {
    // 1. Create Order in Shiprocket
    const orderResponse = await createShiprocketOrder(orderNumber);
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
    const pickupPostcode = "110001"; // TODO: Should come from settings. Hardcoding a default origin for now.
    const deliveryPostcode = order.pincode;
    
    // We calculate weight roughly, or get from the order Response if available.
    // createShiprocketOrder handles weight internally, but we need it here.
    // For now, pass a safe minimum weight of 0.5kg
    const couriers = await getAvailableCouriers(pickupPostcode, deliveryPostcode, 0.5, 0);
    
    if (!couriers || couriers.length === 0) {
      throw new Error("No couriers available for this pincode.");
    }

    // 3. Assign Best Courier and Generate AWB
    const assignResponse = await assignBestCourier(shipmentId, couriers);
    const awb = assignResponse.response?.data?.awb_code;
    const courierName = assignResponse.bestCourier?.courier_name;
    const courierCompanyId = assignResponse.bestCourier?.courier_company_id;
    const shippingCharges = assignResponse.bestCourier?.rate;
    const etd = assignResponse.bestCourier?.etd; // Estimated delivery date

    if (!awb) {
       throw new Error(`Failed to generate AWB: ${JSON.stringify(assignResponse)}`);
    }

    await prisma.shipmentLog.create({
      data: { orderId: order.id, action: "Courier Assigned & AWB Generated", details: assignResponse }
    });

    // 4. Generate Label
    const labelResponse = await generateLabel([shipmentId]);
    const labelUrl = labelResponse.label_created === 1 ? labelResponse.label_url : null;

    // 5. Generate Invoice
    const invoiceResponse = await generateInvoice([shiprocketOrderId]);
    const invoiceUrl = invoiceResponse.is_invoice_created ? invoiceResponse.invoice_url : null;

    // 6. Schedule Pickup (Optional immediately, but let's do it)
    const pickupResponse = await schedulePickup([shipmentId]);
    const pickupScheduled = pickupResponse.pickup_status === 1;

    // 7. Save Everything to DB
    await prisma.order.update({
      where: { id: order.id },
      data: {
        awbCode: awb,
        trackingNumber: awb,
        trackingUrl: `https://shiprocket.co/tracking/${awb}`, // Generic tracking url
        courierName: courierName,
        courierCompany: courierCompanyId?.toString(),
        shippingCharges: Math.round(parseFloat(shippingCharges) * 100), // Convert to paise/cents
        labelUrl: labelUrl,
        invoiceUrl: invoiceUrl,
        pickupScheduled: pickupScheduled,
        shipmentStatus: "READY_TO_SHIP",
        estimatedDelivery: etd ? new Date(etd) : undefined,
      }
    });

    await prisma.shipmentLog.create({
      data: { orderId: order.id, action: "Shipment Creation Completed Successfully" }
    });

    console.log(`Successfully processed shipment for order ${orderNumber}`);

  } catch (error: any) {
    console.error(`Failed to process shipment for ${orderNumber}:`, error);
    
    // Log Error
    await prisma.shipmentLog.create({
      data: { 
        orderId: order.id, 
        action: "Shipment Creation Failed", 
        error: error.message,
        status: "FAILED"
      }
    });

    // Increment retry count
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shipmentStatus: "FAILED",
        shipmentRetryCount: { increment: 1 }
      }
    });

    // We do NOT throw here if we are called asynchronously, we let the job finish and cron retry later.
    throw error;
  }
}
