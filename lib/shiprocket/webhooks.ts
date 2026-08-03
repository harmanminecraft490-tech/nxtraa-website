import crypto from "crypto";

import { shiprocketConfig } from "@/lib/config/shiprocket";

export function verifyShiprocketWebhook(
  signature: string | null,
  payload: string,
): boolean {
  const secret = shiprocketConfig.webhookSecret;
  
  if (!secret) {
    // If no secret is configured, we accept the webhook without validation
    // as per Shiprocket accounts that do not use/support webhook secrets.
    return true; 
  }

  if (!signature) {
    // A secret is configured, but the request didn't provide a signature.
    return false;
  }

  // Shiprocket webhook signature validation (HMAC SHA256 of payload using secret)
  // According to Shiprocket docs, x-api-key or jwt can also be used.
  // Actually, Shiprocket sends `x-api-key` header which we can compare.
  
  // If it's a raw HMAC:
  // const expectedSignature = crypto
  //   .createHmac("sha256", secret)
  //   .update(payload)
  //   .digest("hex");
  // return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  
  // Let's implement standard token check for now. We will just check if secret matches the header
  return signature === secret;
}
