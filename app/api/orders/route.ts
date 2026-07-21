import { NextResponse } from "next/server";

import type { OrderAddress } from "@/app/components/lib/orders";
import { getSessionUser } from "@/lib/auth/session";
import { notifyOrderConfirmed } from "@/lib/notifications";
import {
  computeCartPricing,
  createOrderForUser,
  getOrdersForUser,
  isValidCartItems,
} from "@/lib/order-data";

function isValidAddress(address: unknown): address is OrderAddress {
  if (!address || typeof address !== "object") {
    return false;
  }

  const candidate = address as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.phone === "string" &&
    typeof candidate.address === "string" &&
    typeof candidate.city === "string" &&
    typeof candidate.pincode === "string"
  );
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const orders = await getOrdersForUser(user.id);

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to place your order." }, { status: 401 });
  }

  const body = await request.json();
  const items = body.items;
  const address = body.address;
  const payment = String(body.payment ?? "");

  if (!isValidCartItems(items) || !isValidAddress(address)) {
    return NextResponse.json({ error: "Order details are invalid." }, { status: 400 });
  }

  if (!payment) {
    return NextResponse.json({ error: "Select a payment method." }, { status: 400 });
  }

  let paymentStatus = "PENDING";

  // PhonePe online payments carry a merchant transaction ID that we verify
  // server-side by checking the payment status with PhonePe's API.
  if (payment === "PhonePe") {
    const merchantTransactionId = body.merchantTransactionId;
    if (!merchantTransactionId) {
      return NextResponse.json(
        { error: "Missing payment transaction ID." },
        { status: 400 },
      );
    }

    // Check payment status with PhonePe's server (authoritative).
    const { checkPaymentStatus } = await import("@/lib/phonepe");
    const statusResult = await checkPaymentStatus(merchantTransactionId);

    if (!statusResult.success) {
      return NextResponse.json(
        { error: "Payment could not be verified." },
        { status: 400 },
      );
    }

    const state = statusResult.state || "";
    const responseCode = statusResult.code || "";

    if (
      state === "COMPLETED" ||
      responseCode === "PAYMENT_SUCCESS" ||
      responseCode === "SUCCESS"
    ) {
      paymentStatus = "PAID";
    } else if (
      state === "FAILED" ||
      responseCode === "PAYMENT_FAILED" ||
      responseCode === "FAILED"
    ) {
      paymentStatus = "FAILED";
    }
    // Otherwise stays PENDING.

    // Prevent duplicate order: check if this PhonePe transaction was already used.
    if (paymentStatus === "PAID" && statusResult.transactionId) {
      const existingOrder = await import("@/lib/prisma").then((m) =>
        m.default.order.findFirst({
          where: { phonepeTransactionId: statusResult.transactionId },
        }),
      );
      if (existingOrder) {
        return NextResponse.json(
          { error: "This payment has already been processed.", orderId: existingOrder.id },
          { status: 409 },
        );
      }
    }

    // Store the transaction ID for the order.
    body.phonepeTransactionId = statusResult.transactionId || null;
  } else if (payment === "COD") {
    paymentStatus = "PENDING";
  }

  // Prices always come from the catalog, never the client.
  const { subtotal, deliveryFee, total } = await computeCartPricing(items);
  if (total <= 0) {
    return NextResponse.json({ error: "Order total must be greater than zero." }, { status: 400 });
  }

  const order = await createOrderForUser({
    userId: user.id,
    items,
    subtotal,
    deliveryFee,
    total,
    payment,
    address,
    paymentStatus,
    phonepeMerchantTransactionId: body.merchantTransactionId || null,
    phonepeTransactionId: body.phonepeTransactionId || null,
  });

  // Send order notifications (fire-and-forget — never block the response).
  notifyOrderConfirmed({
    orderNumber: order.id,
    userId: user.id,
    recipientName: address.name,
    phone: address.phone,
    email: user.email ?? "",
    address: address.address,
    city: address.city,
    pincode: address.pincode,
    items,
    subtotal,
    deliveryFee,
    discount: 0,
    total,
    payment,
    paymentStatus,
    phonepeTransactionId: body.phonepeTransactionId,
    createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  }).catch(() => {});

  return NextResponse.json({ order }, { status: 201 });
}
