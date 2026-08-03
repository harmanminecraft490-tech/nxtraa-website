import { shiprocketRequest } from "./client";

export async function generateLabel(shipmentIds: number[]) {
  const response = await shiprocketRequest("/courier/generate/label", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: shipmentIds
    })
  });
  return response;
}

export async function generateInvoice(orderIds: number[]) {
  const response = await shiprocketRequest("/orders/print/invoice", {
    method: "POST",
    body: JSON.stringify({
      ids: orderIds
    })
  });
  return response;
}
