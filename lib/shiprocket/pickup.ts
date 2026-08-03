import { shiprocketRequest } from "./client";

export async function schedulePickup(shipmentIds: number[]) {
  const response = await shiprocketRequest("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: shipmentIds
    })
  });
  return response;
}
