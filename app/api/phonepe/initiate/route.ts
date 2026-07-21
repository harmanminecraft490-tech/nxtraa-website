import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import {
  initiatePayment,
  generateMerchantTransactionId,
  isPhonePeConfigured,
} from "@/lib/phonepe";
import { computeCartPricing, isValidCartItems } from "@/lib/order-data";

/**
 * POST /api/phonepe/initiate
 *
 * 1. Authenticate the user
 * 2. Validate the cart items and compute pricing (server-side, from catalog)
 * 3. Generate a unique merchant transaction ID
 * 4. Call PhonePe's /pg/v1/pay endpoint
 * 5. Return the PhonePe redirect URL so the client can send the user there
 *
 * The order itself is NOT created here — that happens after payment
 * verification (see /api/phonepe/verify).
 */
export async function POST(request: NextRequest) {
  if (!isPhonePeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Payment gateway not configured. Please set PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX, and PHONEPE_REDIRECT_URL.",
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

    if (!isValidCartItems(body.items)) {
      return NextResponse.json({ error: "Cart items are invalid." }, { status: 400 });
    }

    const { total } = await computeCartPricing(body.items);
    if (total <= 0) {
      return NextResponse.json({ error: "Order total must be greater than zero." }, { status: 400 });
    }

    // Amount in paise.
    const amountInPaise = Math.round(total * 100);
    const merchantTransactionId = generateMerchantTransactionId();

    const result = await initiatePayment({
      merchantTransactionId,
      merchantUserId: user.id,
      amount: amountInPaise,
      mobileNumber: typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : undefined,
    });

    if (!result.success || !result.redirectUrl) {
      return NextResponse.json(
        {
          error: result.message || "Failed to initiate payment. Please try again.",
          code: result.code,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl,
      merchantTransactionId: result.merchantTransactionId,
    });
  } catch (error) {
    console.error("PhonePe payment initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment. Please try again." },
      { status: 500 },
    );
  }
}
