import { NextResponse } from "next/server";

import type { OrderAddress } from "@/app/components/lib/orders";
import { getSessionUser } from "@/lib/auth/session";
import { createCashfreeOrder, isCashfreeConfigured } from "@/lib/cashfree";
import {
  computeCartPricing,
  createOrderForUser,
  generateUniqueOrderNumber,
  isValidCartItems,
} from "@/lib/order-data";

/**
 * The payment methods the Cashfree checkout is restricted to:
 * UPI, Cards, Net Banking and Wallets. Cashfree requires a comma-separated
 * string of its method codes: upi, cc (credit), dc (debit), nb (net banking),
 * app (wallets).
 */
const CASHFREE_PAYMENT_METHODS = "upi,cc,dc,nb,app";

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
 * POST /api/cashfree/orders
 *
 * 1. Authenticate the user
 * 2. Validate the cart items + address and compute pricing server-side
 *    (prices always come from the catalog, never the client)
 * 3. Create the order at Cashfree and get a `payment_session_id`
 * 4. Create the DB order as PENDING (Cashfree's order_id == our order number)
 * 5. Return the payment session id so the client can open the Cashfree checkout
 *
 * The DB order is created PENDING here and later flipped to PAID/FAILED only by
 * the verified webhook or the server-side verify route — never by the client.
 */
export async function POST(request: Request) {
  if (!isCashfreeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Payment gateway not configured. Please set CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET, and NEXT_PUBLIC_CASHFREE_ENV.",
      },
      { status: 500 },
    );
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to pay." }, { status: 401 });
  }

  try {
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

    // Prices always come from the catalog, never the client.
    const { subtotal, deliveryFee, total } = await computeCartPricing(items);
    if (total <= 0) {
      return NextResponse.json(
        { error: "Order total must be greater than zero." },
        { status: 400 },
      );
    }

    // Amount in paise (Cashfree expects the minor unit).
    const amountInPaise = Math.round(total * 100);

    // Pre-generate the order number so it can double as Cashfree's order_id.
    const orderNumber = await generateUniqueOrderNumber();
    const phone = address.phone.replace(/\D/g, "");

    // 1. Create the order at Cashfree. On failure we return early WITHOUT
    //    creating a DB order, so no orphan PENDING orders are left behind.
    const cashfreeResult = await createCashfreeOrder({
      orderId: orderNumber,
      amount: amountInPaise,
      currency: "INR",
      customerName: address.name,
      customerPhone: phone,
      customerEmail: user.email ?? undefined,
      paymentMethods: CASHFREE_PAYMENT_METHODS,
    });

    if (!cashfreeResult.success || !cashfreeResult.paymentSessionId) {
      return NextResponse.json(
        {
          error: cashfreeResult.message || "Failed to initialize payment. Please try again.",
          code: cashfreeResult.code,
        },
        { status: 502 },
      );
    }

    // 2. Create the DB order as PENDING, stamped with Cashfree's order reference.
    const order = await createOrderForUser({
      userId: user.id,
      items,
      subtotal,
      deliveryFee,
      total,
      payment,
      address,
      paymentStatus: "PENDING",
      cashfreeOrderId: cashfreeResult.cfOrderId ?? null,
      cashfreePaymentStatus: cashfreeResult.orderStatus ?? null,
      orderNumber,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentSessionId: cashfreeResult.paymentSessionId,
      cfOrderId: cashfreeResult.cfOrderId ?? null,
    });
  } catch (error) {
    console.error("Cashfree payment initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment. Please try again." },
      { status: 500 },
    );
  }
}
