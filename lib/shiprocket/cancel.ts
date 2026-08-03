import { shiprocketRequest } from "./client";

export async function cancelShiprocketOrder(shiprocketOrderId?: string, awbCode?: string) {
  if (awbCode) {
    // Cancel the AWB/Shipment
    console.log(`[Shiprocket Cancel] Cancelling AWB: ${awbCode}`);
    const response = await shiprocketRequest("/orders/cancel/shipment/awbs", {
      method: "POST",
      body: JSON.stringify({ awbs: [awbCode] })
    });
    return response;
  }
  
  if (shiprocketOrderId) {
    // Cancel the Order (not yet shipped)
    console.log(`[Shiprocket Cancel] Cancelling Order ID: ${shiprocketOrderId}`);
    const response = await shiprocketRequest("/orders/cancel", {
      method: "POST",
      body: JSON.stringify({ ids: [shiprocketOrderId] })
    });
    return response;
  }

  throw new Error("Missing shiprocketOrderId or awbCode to cancel order in Shiprocket");
}
