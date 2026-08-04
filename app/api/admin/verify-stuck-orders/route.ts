import { NextResponse } from "next/server";

import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import {
  fetchCashfreeOrder,
  isCashfreeConfigured,
  mapCashfreeStatus,
  applyCashfreePaymentResult,
} from "@/lib/cashfree";

const PREPAID_METHODS = ["upi", "card", "net banking", "wallet"];

function isPrepaidMethod(payment: string): boolean {
  return PREPAID_METHODS.some((m) => payment.toLowerCase().includes(m));
}

/**
 * POST /api/admin/verify-stuck-orders
 *
 * Finds all prepaid orders stuck in PENDING and re-verifies them against
 * Cashfree's server. This fixes orders where the webhook or return-page
 * verify failed to update the DB.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCashfreeConfigured()) {
    return NextResponse.json(
      { error: "Cashfree is not configured." },
      { status: 500 },
    );
  }

  try {
    // Find all prepaid orders stuck in PENDING
    const stuckOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PENDING",
        NOT: { payment: "COD" },
      },
      select: {
        id: true,
        orderNumber: true,
        payment: true,
        total: true,
        paymentStatus: true,
      },
    });

    const results: Array<{
      orderNumber: string;
      previousStatus: string;
      newStatus: string;
      error?: string;
    }> = [];

    for (const order of stuckOrders) {
      if (!isPrepaidMethod(order.payment)) {
        results.push({
          orderNumber: order.orderNumber,
          previousStatus: "PENDING",
          newStatus: "PENDING",
          error: "Non-prepaid method, skipped",
        });
        continue;
      }

      // Re-verify with Cashfree
      const statusResult = await fetchCashfreeOrder(order.orderNumber);
      if (!statusResult.success || !statusResult.order) {
        results.push({
          orderNumber: order.orderNumber,
          previousStatus: "PENDING",
          newStatus: "PENDING",
          error: statusResult.message,
        });
        continue;
      }

      const cfOrder = statusResult.order;
      const latestPayment =
        cfOrder.payments.length > 0
          ? cfOrder.payments[cfOrder.payments.length - 1]
          : undefined;
      const paymentStatus = mapCashfreeStatus(
        cfOrder.orderStatus,
        latestPayment?.paymentStatus,
      );

      const successfulPayment =
        cfOrder.payments.find(
          (p) => p.paymentStatus?.toUpperCase() === "SUCCESS",
        ) ??
        (paymentStatus === "PAID" ? latestPayment : undefined);

      const application = {
        paymentStatus,
        cashfreeOrderId: cfOrder.cfOrderId ?? null,
        cashfreePaymentId: successfulPayment?.cfPaymentId ?? null,
        cashfreePaymentStatus:
          successfulPayment?.paymentStatus ?? cfOrder.orderStatus ?? null,
        cashfreeTransactionId:
          successfulPayment?.pgTransactionId ??
          successfulPayment?.cfPaymentId ??
          null,
      };

      const result = await applyCashfreePaymentResult({
        orderNumber: order.orderNumber,
        application,
      });

      results.push({
        orderNumber: order.orderNumber,
        previousStatus: "PENDING",
        newStatus: paymentStatus,
        ...(result.status === "not-found" ? { error: "Order not found in DB" } : {}),
      });
    }

    const fixed = results.filter((r) => r.newStatus === "PAID").length;
    const failed = results.filter((r) => r.newStatus === "FAILED").length;
    const stillPending = results.filter((r) => r.newStatus === "PENDING").length;

    return NextResponse.json({
      success: true,
      total: stuckOrders.length,
      fixed,
      failed,
      stillPending,
      results,
    });
  } catch (error) {
    console.error("Verify stuck orders error:", error);
    return NextResponse.json(
      { error: "Failed to verify orders." },
      { status: 500 },
    );
  }
}
