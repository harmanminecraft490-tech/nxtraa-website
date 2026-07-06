import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

import { getSessionUser } from "@/lib/auth/session";
import { computeCartPricing, isValidCartItems } from "@/lib/order-data";

// Only initialize Razorpay if keys are available
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

export async function POST(request: NextRequest) {
  if (!razorpay) {
    return NextResponse.json(
      { error: "Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
      { status: 500 }
    );
  }

  // Must be signed in — the order is tied to a real user.
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to pay." }, { status: 401 });
  }

  try {
    const body = await request.json();

    // The amount is derived from the catalog, never trusted from the client.
    // This prevents a caller from paying Rs.1 for a full-priced cart.
    if (!isValidCartItems(body.items)) {
      return NextResponse.json({ error: "Cart items are invalid." }, { status: 400 });
    }

    const { total } = await computeCartPricing(body.items);
    if (total <= 0) {
      return NextResponse.json({ error: "Order total must be greater than zero." }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      // Razorpay expects an integer number of paise.
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: typeof body.orderId === "string" ? body.orderId : `rcpt_${user.id}`,
      payment_capture: 1,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!razorpay) {
    return NextResponse.json(
      { error: "Razorpay not configured." },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams?.get("payment_id");

  if (!paymentId) {
    return NextResponse.json(
      { error: "Payment ID is required" },
      { status: 400 }
    );
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Razorpay payment fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
}