import { createHmac, timingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

import type { OrderAddress } from "@/app/components/lib/orders";
import { getSessionUser } from "@/lib/auth/session";
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

/**
 * Verifies a Razorpay payment signature: HMAC_SHA256(order_id|payment_id, secret).
 * Returns false on any mismatch so a forged success handler cannot create a paid
 * order without an actual captured payment.
 */
function isValidRazorpaySignature(
  orderId: unknown,
  paymentId: unknown,
  signature: unknown,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return false;
  }
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
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

  // Online payments must carry a valid Razorpay signature that we verify against
  // our secret — otherwise the paid amount cannot be trusted.
  if (payment === "Razorpay") {
    const ok = isValidRazorpaySignature(
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature,
    );
    if (!ok) {
      return NextResponse.json(
        { error: "Payment could not be verified." },
        { status: 400 },
      );
    }
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
  });

  return NextResponse.json({ order }, { status: 201 });
}
