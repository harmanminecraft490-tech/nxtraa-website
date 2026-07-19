import { NextResponse } from "next/server";

import type { OrderAddress } from "@/app/components/lib/orders";
import { getSessionUser } from "@/lib/auth/session";
import { verifyRazorpaySignature } from "@/lib/payment-verification";
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

  // Online payments must carry a valid Razorpay signature that we verify against
  // our secret — otherwise the paid amount cannot be trusted.
  if (payment === "Razorpay") {
    const ok = verifyRazorpaySignature(
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
    paymentStatus = "PAID";
  } else if (payment === "COD") {
    paymentStatus = "PENDING";
  }

  // Prevent duplicate order creation: check if this Razorpay payment ID was
  // already used for an order. This guards against race conditions where the
  // frontend retries the verify call.
  if (payment === "Razorpay" && body.razorpayPaymentId) {
    const existingOrder = await import("@/lib/prisma").then((m) =>
      m.default.order.findFirst({
        where: { razorpayPaymentId: body.razorpayPaymentId },
      }),
    );
    if (existingOrder) {
      return NextResponse.json(
        { error: "This payment has already been processed.", orderId: existingOrder.id },
        { status: 409 },
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
    paymentStatus,
    razorpayOrderId: body.razorpayOrderId || null,
    razorpayPaymentId: body.razorpayPaymentId || null,
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
    razorpayPaymentId: body.razorpayPaymentId,
    createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  }).catch(() => {});

  return NextResponse.json({ order }, { status: 201 });
}
