import { shiprocketRequest } from "./client";
import prisma from "@/lib/prisma";

export async function getLiveTracking(awb: string) {
  const response = await shiprocketRequest(`/courier/track/awb/${awb}`);
  return response;
}

export async function updateTrackingInDB(orderId: string, trackingData: any) {
  // Map trackingData to our DB schema
  // For this we'll update the order status if delivered, and store the raw response
  const track = trackingData?.tracking_data?.track_status === 1 ? trackingData?.tracking_data?.shipment_track?.[0] : null;
  const activities = trackingData?.tracking_data?.shipment_track_activities || [];

  if (!track) return;

  const currentStatus = track.current_status;
  
  await prisma.order.update({
    where: { id: orderId },
    data: {
      shipmentStatus: currentStatus,
      lastTrackingUpdate: new Date(),
      estimatedDelivery: track.expected_date ? new Date(track.expected_date) : undefined,
      shipmentResponse: trackingData, // Cache the live tracking response for the frontend
    }
  });

  await prisma.shipmentLog.create({
    data: {
      orderId,
      action: `Tracking Updated: ${currentStatus}`,
      status: currentStatus,
      details: trackingData,
    }
  });
}
