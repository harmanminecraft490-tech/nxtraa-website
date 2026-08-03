import { NextRequest, NextResponse } from "next/server";

import {
  applyCashfreePaymentResult,
  verifyCashfreeWebhookSignature,
} from "@/lib/cashfree";

/**
 * POST /api/cashfree/webhook
 *
 * Cashfree POSTs payment events here server-to-server. Every order mutation is
 * gated on a valid `x-webhook-signature` — the payload is rejected outright if
 * the signature does not match `base64(HMAC-SHA256(clientSecret, timestamp + body))`.
 *
 * Notes:
 *  - The signature is verified BEFORE any DB read/write.
 *  - Updates are idempotent and never downgrade a PAID order.
 *  - We always return 2xx for verified events (even when the order is not
 *    found yet) so Cashfree stops retrying; unverified events get 401.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  // 1. Verify the signature before touching anything.
  const event = verifyCashfreeWebhookSignature(signature, rawBody, timestamp);
  if (!event) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  // 2. Ignore events we don't understand (payment events are the ones we act on).
  if (!event.orderId) {
    return NextResponse.json({ received: true });
  }

  const { type } = event;

  // 3. Map the event to our payment status.
  let paymentStatus: "PAID" | "FAILED" | "PENDING";
  if (type === "PAYMENT_SUCCESS_WEBHOOK") {
    paymentStatus = "PAID";
  } else if (type === "PAYMENT_FAILED_WEBHOOK") {
    paymentStatus = "FAILED";
  } else {
    // PAYMENT_USER_DROPPED_WEBHOOK and any other event → keep the order open;
    // the order may still be paid via a later attempt.
    paymentStatus = "PENDING";
  }

  // 4. Apply the result idempotently (safe to replay — Cashfree retries on 5xx).
  await applyCashfreePaymentResult({
    orderNumber: event.orderId,
    application: {
      paymentStatus,
      cashfreeOrderId: event.cfOrderId ?? null,
      cashfreePaymentId: event.payment?.cfPaymentId ?? null,
      cashfreePaymentStatus:
        event.payment?.paymentStatus ?? event.orderStatus ?? null,
      cashfreeTransactionId:
        event.payment?.pgTransactionId ?? event.payment?.cfPaymentId ?? null,
    },
  });

  return NextResponse.json({ received: true });
}
