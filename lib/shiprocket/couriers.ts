import { shiprocketRequest } from "./client";

export async function getAvailableCouriers(pickupPostcode: string, deliveryPostcode: string, weight: number, cod: 0 | 1) {
  // Use /courier/serviceability to check available couriers
  const response = await shiprocketRequest(`/courier/serviceability/?pickup_postcode=${pickupPostcode}&delivery_postcode=${deliveryPostcode}&weight=${weight}&cod=${cod}`);
  return response.data?.available_courier_companies || [];
}

export async function assignBestCourier(shipmentId: number, couriers: any[]) {
  // Sort couriers based on user preference: Cost, Time, Rating
  // Shiprocket already returns them, we can sort them
  const sortedCouriers = couriers.sort((a, b) => {
    // 1. Availability/RTO
    if (a.rto_performance && b.rto_performance && a.rto_performance !== b.rto_performance) {
       return b.rto_performance - a.rto_performance;
    }
    // 2. Cost
    if (a.rate !== b.rate) {
      return a.rate - b.rate;
    }
    // 3. Estimated delivery time
    const aTime = a.etd_hours || 999;
    const bTime = b.etd_hours || 999;
    return aTime - bTime;
  });

  const bestCourierId = sortedCouriers[0]?.courier_company_id;
  if (!bestCourierId) {
    throw new Error("No couriers available for this route.");
  }

  // Assign courier and generate AWB in one step
  const response = await shiprocketRequest("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: shipmentId,
      courier_id: bestCourierId
    })
  });

  return {
    ...response,
    bestCourier: sortedCouriers[0]
  };
}
