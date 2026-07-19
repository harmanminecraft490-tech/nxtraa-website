import Razorpay from "razorpay";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance: Razorpay | null = null;

/**
 * Get the Razorpay instance. Returns null if keys are not configured.
 * Lazy-initialized so the server can boot without Razorpay keys during
 * non-payment operations (e.g. product browsing).
 */
export function getRazorpay(): Razorpay | null {
  if (razorpayInstance) return razorpayInstance;
  if (!razorpayKeyId || !razorpayKeySecret) return null;

  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });

  return razorpayInstance;
}

/**
 * Verify that Razorpay environment variables are set.
 */
export function isRazorpayConfigured(): boolean {
  return !!(razorpayKeyId && razorpayKeySecret);
}
