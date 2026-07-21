import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { checkPaymentStatus, isPhonePeConfigured } from "@/lib/phonepe";
import { computeCartPricing, createOrderForUser, isValidCartItems } from "@/lib/order-data";

/**
 * POST /api/phonepe/verify
 *
 * Called after PhonePe redirects the user back to our site.
 *
 * 1. Validate the merchantTransactionId was provided
 * 2. Check payment status with PhonePe's server (authoritative)
 * 3. If PAYMENT_SUCCESS / COMPLETED → create an order with paymentStatus=PAID
 * 4. If PAYMENT_PENDING / PENDING → keep as PENDING
 * 5. If any failure → create order with paymentStatus=FAILED
 * 6. Return order details to the client
 */
export async function POST(request: NextRequest) {
  if (!isPhonePeConfigured()) {
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

    const {
      items,
      payment,
      address,
      merchantTransactionId,
    } = body;

    if (!merchantTransactionId) {
      return NextResponse.json(
        { error: "Missing transaction ID." },
        { status: 400 },
      );
    }

    // Check payment status with PhonePe.
    const statusResult = await checkPaymentStatus(merchantTransactionId);

    if (!statusResult.success) {
      return NextResponse.json(
        { error: statusResult.message || "Could not verify payment status." },
        { status: 502 },
      );
    }

    // Determine payment status from PhonePe response.
    // Completed states: COMPLETED, PAYMENT_SUCCESS
    // Pending states: PENDING, PAYMENT_PENDING
    // Failed states: FAILED, PAYMENT_FAILED, USER_DROPPED, etc.
    let paymentStatus: string;
    const state = statusResult.state || "";
    const responseCode = statusResult.code || "";

    if (
      state === "COMPLETED" ||
      responseCode === "PAYMENT_SUCCESS" ||
      responseCode === "SUCCESS"
    ) {
      paymentStatus = "PAID";
    } else if (
      state === "PENDING" ||
      responseCode === "PAYMENT_PENDING" ||
      responseCode === "PENDING"
    ) {
      paymentStatus = "PENDING";
    } else {
      paymentStatus = "FAILED";
    }

    // If items are provided (coming from the checkout page), validate and create order.
    if (items && isValidCartItems(items) && address) {
      // Prevent duplicate order creation.
      if (paymentStatus === "PAID" && statusResult.transactionId) {
        const existingOrder = await import("@/lib/prisma").then((m) =>
          m.default.order.findFirst({
            where: { phonepeTransactionId: statusResult.transactionId },
          }),
        );
        if (existingOrder) {
          return NextResponse.json(
            {
              error: "This payment has already been processed.",
              order: { id: existingOrder.orderNumber },
            },
            { status: 409 },
          );
        }
      }

      // Prices always come from the catalog, never the client.
      const { subtotal: serverSubtotal, deliveryFee: serverFee, total: serverTotal } =
        await computeCartPricing(items);
      if (serverTotal <= 0) {
        return NextResponse.json(
          { error: "Order total must be greater than zero." },
          { status: 400 },
        );
      }

      const order = await createOrderForUser({
        userId: user.id,
        items,
        subtotal: serverSubtotal,
        deliveryFee: serverFee,
        total: serverTotal,
        discount: 0,
        payment: typeof payment === "string" ? payment : "PhonePe",
        address,
        paymentStatus,
        phonepeMerchantTransactionId: merchantTransactionId,
        phonepeTransactionId: statusResult.transactionId || null,
      });

      // Fire-and-forget notifications.
      if (paymentStatus === "PAID") {
        const { notifyOrderConfirmed } = await import("@/lib/notifications");
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
          subtotal: serverSubtotal,
          deliveryFee: serverFee,
          discount: 0,
          total: serverTotal,
          payment: "PhonePe",
          paymentStatus,
          phonepeTransactionId: statusResult.transactionId,
          createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        }).catch(() => {});
      }

      return NextResponse.json({ order }, { status: 201 });
    }

    // No items provided — just checking status (e.g., from the callback page poll).
    return NextResponse.json({
      verified: true,
      paymentStatus,
      transactionId: statusResult.transactionId,
      merchantTransactionId: statusResult.merchantTransactionId,
      state: statusResult.state,
    });
  } catch (error) {
    console.error("PhonePe payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed. Please contact support." },
      { status: 500 },
    );
  }
}
