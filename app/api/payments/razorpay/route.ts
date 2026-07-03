import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

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

  try {
    const { amount, currency = "INR", orderId } = await request.json();

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: orderId,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
    });
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
  const paymentId = searchParams.get("payment_id");

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