import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify a Razorpay payment signature: HMAC_SHA256(order_id|payment_id, secret).
 * Returns false on any mismatch so a forged success handler cannot create a paid
 * order without an actual captured payment.
 */
export function verifyRazorpaySignature(
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

/**
 * Verify a Razorpay webhook signature.
 * The webhook sends a header `X-Razorpay-Signature` containing the HMAC
 * SHA256 hex digest of the raw body with the webhook secret as the key.
 */
export function verifyWebhookSignature(
  body: string,
  signature: unknown,
  secret: string,
): boolean {
  if (typeof signature !== "string") return false;

  const expected = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
