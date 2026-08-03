import { redirect } from "next/navigation";
import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import ShippingDebugClient from "./client";
import prisma from "@/lib/prisma";
import { getShiprocketToken } from "@/lib/shiprocket/client";
import { shiprocketConfig } from "@/lib/config/shiprocket";

export const dynamic = "force-dynamic";

export default async function ShippingDebugPage() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect("/account/signin?next=/admin/shipping-debug");
  }

  // 1. Gather Shiprocket Auth Status
  let tokenStatus = "FAILED";
  let tokenError = null;
  try {
    const token = await getShiprocketToken();
    if (token) tokenStatus = "ACTIVE";
  } catch (e: any) {
    tokenError = e.message;
  }

  // 2. Fetch Latest Shipment Logs (Queue/Jobs)
  const recentLogs = await prisma.shipmentLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { order: { select: { orderNumber: true } } }
  });

  // 3. Fetch Orders with failed shipments
  const failedOrders = await prisma.order.findMany({
    where: { shipmentStatus: "FAILED" },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  // 4. Config check
  const config = {
    emailSet: !!process.env.SHIPROCKET_API_EMAIL,
    passwordSet: !!process.env.SHIPROCKET_API_PASSWORD,
    webhookSecretSet: !!process.env.SHIPROCKET_WEBHOOK_SECRET,
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shipping & Shiprocket Debug</h1>
      <ShippingDebugClient 
        tokenStatus={tokenStatus}
        tokenError={tokenError}
        recentLogs={recentLogs}
        failedOrders={failedOrders}
        config={config}
      />
    </div>
  );
}
