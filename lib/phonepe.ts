/**
 * PhonePe Payment Gateway — server-side utilities.
 *
 * Implements the PhonePe Gateway API v2 for payment initiation, status
 * checking, and signature verification. All sensitive operations run
 * server-side; the client only receives a redirect URL.
 *
 * Required env vars:
 *   PHONEPE_MERCHANT_ID     — PhonePe-assigned merchant ID
 *   PHONEPE_SALT_KEY        — Salt key for X-VERIFY header generation
 *   PHONEPE_SALT_INDEX      — Salt index (integer, e.g. "1")
 *   PHONEPE_ENV             — "UAT" or "PRODUCTION"
 *   PHONEPE_REDIRECT_URL    — Full URL PhonePe redirects to after payment
 *   PHONEPE_CALLBACK_URL    — (Optional) server notification URL
 *
 * Optional:
 *   PHONEPE_CLIENT_VERSION  — API version override (default: "v2")
 */

import { createHash, timingSafeEqual } from "crypto";

// ─── Configuration ───────────────────────────────────────────────────────────

export interface PhonePeConfig {
  merchantId: string;
  saltKey: string;
  saltIndex: string;
  baseUrl: string;
  redirectUrl: string;
  callbackUrl?: string;
  clientVersion: string;
}

function getConfig(): PhonePeConfig | null {
  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;
  const env = process.env.PHONEPE_ENV || "UAT";
  const redirectUrl = process.env.PHONEPE_REDIRECT_URL;
  const callbackUrl = process.env.PHONEPE_CALLBACK_URL;

  if (!merchantId || !saltKey || !saltIndex || !redirectUrl) {
    return null;
  }

  const baseUrl =
    env === "PRODUCTION"
      ? "https://api.phonepe.com/apis/hermes"
      : "https://api-preprod.phonepe.com/apis/hermes";

  return {
    merchantId,
    saltKey,
    saltIndex,
    baseUrl,
    redirectUrl,
    callbackUrl,
    clientVersion: process.env.PHONEPE_CLIENT_VERSION || "v2",
  };
}

export function isPhonePeConfigured(): boolean {
  return getConfig() !== null;
}

// ─── X-VERIFY Header Generation ──────────────────────────────────────────────

/**
 * Generate the X-VERIFY header value required by every PhonePe API call.
 *
 * For POST endpoints:  base64(SHA256(base64(payload) + apiEndpoint + saltKey)) + "###" + saltIndex
 * For GET endpoints:   base64(SHA256(apiEndpoint + saltKey)) + "###" + saltIndex
 */
export function generateXVerifyPost(
  payload: Record<string, unknown>,
  apiEndpoint: string,
  saltKey: string,
  saltIndex: string,
): string {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const hash = createHash("sha256")
    .update(payloadBase64 + apiEndpoint + saltKey)
    .digest("hex");
  const xVerify = Buffer.from(hash, "hex").toString("base64");
  return `${xVerify}###${saltIndex}`;
}

export function generateXVerifyGet(
  apiEndpoint: string,
  saltKey: string,
  saltIndex: string,
): string {
  const hash = createHash("sha256")
    .update(apiEndpoint + saltKey)
    .digest("hex");
  const xVerify = Buffer.from(hash, "hex").toString("base64");
  return `${xVerify}###${saltIndex}`;
}

// ─── Payment Initiation ──────────────────────────────────────────────────────

export interface InitiatePaymentParams {
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number; // in paise (Rs. 100 = 10000)
  mobileNumber?: string;
}

export interface PhonePeRedirectInfo {
  url: string;
  method: string;
}

export interface InitiatePaymentResult {
  success: boolean;
  code: string;
  message: string;
  redirectUrl?: string;
  merchantTransactionId: string;
  transactionId?: string;
}

/**
 * Initiate a PhonePe payment page transaction.
 * Returns the redirect URL to send the user to PhonePe's checkout.
 */
export async function initiatePayment(
  params: InitiatePaymentParams,
): Promise<InitiatePaymentResult> {
  const config = getConfig();
  if (!config) {
    return {
      success: false,
      code: "CONFIG_ERROR",
      message: "PhonePe is not configured. Set PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX, and PHONEPE_REDIRECT_URL.",
      merchantTransactionId: params.merchantTransactionId,
    };
  }

  const apiEndpoint = `/pg/v1/pay`;
  const payload: Record<string, unknown> = {
    merchantId: config.merchantId,
    merchantTransactionId: params.merchantTransactionId,
    merchantUserId: params.merchantUserId,
    amount: params.amount,
    redirectUrl: config.redirectUrl,
    redirectMode: "REDIRECT",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  if (config.callbackUrl) {
    payload.callbackUrl = config.callbackUrl;
  }

  if (params.mobileNumber) {
    payload.mobileNumber = params.mobileNumber;
  }

  const xVerify = generateXVerifyPost(payload, apiEndpoint, config.saltKey, config.saltIndex);

  try {
    const response = await fetch(`${config.baseUrl}${apiEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as {
      success: boolean;
      code: string;
      message: string;
      data?: {
        merchantTransactionId: string;
        transactionId?: string;
        instrumentResponse?: {
          type: string;
          redirectInfo?: {
            url: string;
            method: string;
          };
        };
      };
    };

    if (!response.ok || !data.success) {
      return {
        success: false,
        code: data.code || "API_ERROR",
        message: data.message || `PhonePe API returned HTTP ${response.status}`,
        merchantTransactionId: params.merchantTransactionId,
      };
    }

    const redirectUrl = data.data?.instrumentResponse?.redirectInfo?.url;

    return {
      success: true,
      code: data.code,
      message: data.message,
      redirectUrl,
      merchantTransactionId: data.data?.merchantTransactionId || params.merchantTransactionId,
      transactionId: data.data?.transactionId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: `PhonePe API request failed: ${message}`,
      merchantTransactionId: params.merchantTransactionId,
    };
  }
}

// ─── Payment Status Check ────────────────────────────────────────────────────

export interface PaymentStatusResult {
  success: boolean;
  code: string;
  message: string;
  state?: string;
  transactionId?: string;
  merchantTransactionId: string;
  amount?: number;
  paymentInstrument?: Record<string, unknown>;
}

/**
 * Check the status of a PhonePe transaction.
 * This is the authoritative source of truth for whether a payment succeeded.
 */
export async function checkPaymentStatus(
  merchantTransactionId: string,
): Promise<PaymentStatusResult> {
  const config = getConfig();
  if (!config) {
    return {
      success: false,
      code: "CONFIG_ERROR",
      message: "PhonePe is not configured.",
      merchantTransactionId,
    };
  }

  const apiEndpoint = `/pg/v1/status/${config.merchantId}/${merchantTransactionId}`;
  const xVerify = generateXVerifyGet(apiEndpoint, config.saltKey, config.saltIndex);

  try {
    const response = await fetch(`${config.baseUrl}${apiEndpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": config.merchantId,
      },
    });

    const data = (await response.json()) as {
      success: boolean;
      code: string;
      message: string;
      data?: {
        merchantTransactionId: string;
        transactionId: string;
        amount: number;
        state: string;
        responseCode: string;
        paymentInstrument?: Record<string, unknown>;
      };
    };

    if (!response.ok || !data.success) {
      return {
        success: false,
        code: data.code || "STATUS_ERROR",
        message: data.message || `Status check failed with HTTP ${response.status}`,
        merchantTransactionId,
      };
    }

    return {
      success: true,
      code: data.data?.responseCode || data.code,
      message: data.message,
      state: data.data?.state,
      transactionId: data.data?.transactionId,
      merchantTransactionId: data.data?.merchantTransactionId || merchantTransactionId,
      amount: data.data?.amount,
      paymentInstrument: data.data?.paymentInstrument,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: `PhonePe status check failed: ${message}`,
      merchantTransactionId,
    };
  }
}

// ─── Signature Verification (Callback / Redirect) ────────────────────────────

export interface PhonePeCallbackData {
  code: string;
  merchantId: string;
  transactionId: string;
  amount?: number;
  providerReferenceId?: string;
  paramSize?: number;
  checksum?: string;
}

/**
 * Decode and verify a PhonePe callback/redirect response.
 * The callback sends a `code` query parameter that is a base64-encoded JSON
 * payload containing the transaction result.
 */
export function decodeCallbackCode(code: string): PhonePeCallbackData | null {
  try {
    const decoded = Buffer.from(code, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as PhonePeCallbackData;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Verify the checksum on a PhonePe callback response.
 * The checksum is: SHA256(base64(payload) + saltKey + apiEndpoint)
 * which should match the incoming checksum value.
 */
export function verifyCallbackChecksum(
  code: string,
  checksum: string,
  apiEndpoint: string,
): boolean {
  const config = getConfig();
  if (!config) return false;

  const expectedHash = createHash("sha256")
    .update(code + config.saltKey + apiEndpoint)
    .digest("hex");

  try {
    const a = Buffer.from(expectedHash);
    const b = Buffer.from(checksum);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ─── Refund (Refund-Ready Architecture) ──────────────────────────────────────

export interface RefundResult {
  success: boolean;
  code: string;
  message: string;
  refundTransactionId?: string;
}

/**
 * Initiate a refund for a completed transaction.
 * The refund-ready architecture stores the original transaction ID so this
 * can be called when an admin processes a refund.
 */
export async function initiateRefund(
  originalTransactionId: string,
  merchantTransactionId: string,
  amount: number,
): Promise<RefundResult> {
  const config = getConfig();
  if (!config) {
    return {
      success: false,
      code: "CONFIG_ERROR",
      message: "PhonePe is not configured.",
    };
  }

  const apiEndpoint = `/pg/v1/refund`;
  const payload = {
    merchantId: config.merchantId,
    merchantTransactionId,
    originalTransactionId,
    amount,
    callbackUrl: config.callbackUrl || undefined,
  };

  const xVerify = generateXVerifyPost(payload, apiEndpoint, config.saltKey, config.saltIndex);

  try {
    const response = await fetch(`${config.baseUrl}${apiEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as {
      success: boolean;
      code: string;
      message: string;
      data?: {
        transactionId: string;
      };
    };

    return {
      success: data.success,
      code: data.code,
      message: data.message,
      refundTransactionId: data.data?.transactionId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: `Refund request failed: ${message}`,
    };
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Generate a unique merchant transaction ID.
 * PhonePe requires this to be unique per transaction.
 */
export function generateMerchantTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NXT${timestamp}${random}`;
}
