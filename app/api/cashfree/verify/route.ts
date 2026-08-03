import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import {
  applyCashfreePaymentResult,
  fetchCashfreeOrder,
  isCashfreeConfigured,
  mapCashfreeStatus,
} from "@/lib/cashfree";
import { getOrderByNumberForUser } from "@/lib/order-data";

/**
 * POST /api/cashfree/verify
 *
 * Called from the Cashfree return page after the browser is redirected back.
 * The return URL's query params are NEVER trusted — this route re-checks the
 * order state with Cashfree's server (PGFetchOrder), which is authoritative,
 * and only then updates the DB order.
 */
export async function POST(request: Request) {
  if (!isCashfreeConfigured()) {
    return NextResponse.json(
      { error: "Payment gateway not configured." },
      { status: 500 },
    );
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to verify payment." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID." }, { status: 400 });
    }

    // The order must belong to the signed-in user.
    const ownedOrder = await getOrderByNumberForUser(orderId, user.id);
    if (!ownedOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Authoritative server-side status check.
    const statusResult = await fetchCashfreeOrder(orderId);
    if (!statusResult.success || !statusResult.order) {
      return NextResponse.json(
        { error: statusResult.message || "Could not verify payment status." },
        { status: 502 },
      );
    }

    const order = statusResult.order;
    const latestPayment = order.payments.length > 0 ? order.payments[order.payments.length - 1] : undefined;
    const paymentStatus = mapCashfreeStatus(order.orderStatus, latestPayment?.paymentStatus);

    // The successful payment (if any) carries the payment + transaction ids.
    const successfulPayment = order.payments.find(
      (p) => p.paymentStatus?.toUpperCase() === "SUCCESS",
    ) ?? (paymentStatus === "PAID" ? latestPayment : undefined);

    const application = {
      paymentStatus,
      cashfreeOrderId: order.cfOrderId,
      cashfreePaymentId: successfulPayment?.cfPaymentId ?? null,
      cashfreePaymentStatus: successfulPayment?.paymentStatus ?? order.orderStatus ?? null,
      cashfreeTransactionId:
        successfulPayment?.pgTransactionId ?? successfulPayment?.cfPaymentId ?? null,
    };

    const result = await applyCashfreePaymentResult({ orderNumber: orderId, application });

    if (result.status === "not-found") {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      verified: true,
      paymentStatus,
      orderId,
      transactionId: application.cashfreeTransactionId,
    });
  } catch (error) {
    console.error("Cashfree payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed. Please contact support." },
      { status: 500 },
    );
  }
}
