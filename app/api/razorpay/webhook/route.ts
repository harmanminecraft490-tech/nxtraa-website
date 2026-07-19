import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/payment-verification";
import { getAllProductsCached } from "@/app/components/lib/products-cache";

/**
 * Razorpay Webhook Handler
 *
 * Handles payment lifecycle events from Razorpay. This endpoint is called by
 * Razorpay's servers — never by the frontend.
 *
 * Required env var: RAZORPAY_WEBHOOK_SECRET
 *
 * Supported events:
 *   - payment.captured  → Mark order as PAID
 *   - payment.failed    → Mark order as FAILED
 *   - order.paid        → Mark order as PAID
 *
 * All handlers are idempotent — processing the same event twice is safe.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("RAZORPAY_WEBHOOK_SECRET not configured. Skipping webhook verification.");
    // Still process — but log the warning. In production, you should ALWAYS
    // set the webhook secret and reject unverified webhooks.
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    // Verify webhook signature if secret is configured.
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature. Rejecting webhook.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment?: {
          entity: {
            id: string;
            order_id: string;
            amount: number;
            currency: string;
            status: string;
            method?: string;
          };
        };
        order?: {
          entity: {
            id: string;
            amount: number;
            currency: string;
            status: string;
          };
        };
      };
    };

    console.log(`Webhook received: ${event.event}`);

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        // Idempotent: only update if the order is not already PAID.
        await prisma.order.updateMany({
          where: {
            razorpayOrderId: payment.order_id,
            paymentStatus: { not: "PAID" },
          },
          data: {
            paymentStatus: "PAID",
            razorpayPaymentId: payment.id,
          },
        });

        console.log(`Payment captured: ${payment.id} for order ${payment.order_id}`);
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        // Mark the order as FAILED if it exists and is not already PAID.
        // This prevents overwriting a successful payment with a failure from
        // a later retry attempt.
        await prisma.order.updateMany({
          where: {
            razorpayOrderId: payment.order_id,
            paymentStatus: { not: "PAID" },
          },
          data: {
            paymentStatus: "FAILED",
          },
        });

        console.log(`Payment failed: ${payment.id} for order ${payment.order_id}`);
        break;
      }

      case "order.paid": {
        const order = event.payload.order?.entity;
        if (!order) break;

        await prisma.order.updateMany({
          where: {
            razorpayOrderId: order.id,
            paymentStatus: { not: "PAID" },
          },
          data: {
            paymentStatus: "PAID",
          },
        });

        console.log(`Order paid: ${order.id}`);
        break;
      }

      default:
        // Unhandled event type — acknowledge it so Razorpay doesn't retry.
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always return 200 to prevent Razorpay from retrying. We log errors
    // for monitoring but don't let webhook failures block the payment flow.
    return NextResponse.json({ received: true });
  }
}
