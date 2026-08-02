/**
 * Cashfree Payment Gateway — server-side utilities (official cashfree-pg SDK).
 *
 * All sensitive operations run server-side. The client never sees the
 * client ID or client secret — it only receives a `payment_session_id`,
 * which it hands to the Cashfree.js checkout widget.
 *
 * Required env vars:
 *   CASHFREE_CLIENT_ID        — Cashfree-assigned client ID (x-client-id)
 *   CASHFREE_CLIENT_SECRET    — Cashfree-assigned client secret (x-client-secret)
 *   NEXT_PUBLIC_CASHFREE_ENV  — "sandbox" or "production" (also used by the client SDK)
 *
 * Optional:
 *   CASHFREE_RETURN_URL       — Full URL Cashfree redirects the browser to after payment
 *                               (defaults to the site origin + /payment/cashfree/status)
 *   CASHFREE_WEBHOOK_URL      — Full URL Cashfree POSTs webhooks to
 *                               (defaults to the site origin + /api/cashfree/webhook)
 */

import { Cashfree, CFEnvironment, type PaymentEntity } from "cashfree-pg";

import prisma from "@/lib/prisma";
import { notifyOrderConfirmed } from "@/lib/notifications";
import type { CartItem } from "@/app/components/lib/cartcontext";

/**
 * The SDK's OrderEntity type omits the `payments` array that Cashfree actually
 * returns on order fetch / webhooks. Model it locally so we can read payment
 * details without losing type safety on the fields the SDK does declare.
 */
interface CashfreeOrderPayload {
  order_id?: string;
  cf_order_id?: string;
  order_status?: string;
  order_amount?: number;
  order_currency?: string;
  payment_session_id?: string;
  payments?: Array<Partial<PaymentEntity> & { payment_method?: string }>;
}

// ─── Configuration ───────────────────────────────────────────────────────────

export type CashfreeEnvironment = "sandbox" | "production";

export function getCashfreeEnvironment(): CashfreeEnvironment {
  return process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox";
}

/**
 * Create the Cashfree SDK instance. Returns null when credentials are missing
 * so the server can boot during non-payment operations.
 */
export function getCashfree(): Cashfree | null {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const environment =
    getCashfreeEnvironment() === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  return new Cashfree(environment, clientId, clientSecret);
}

export function isCashfreeConfigured(): boolean {
  return !!(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
}

/** The site origin used for Cashfree return/webhook URLs when not overridden by env. */
function getSiteOrigin(): string {
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return "http://localhost:3000";
}

/**
 * Full URL Cashfree redirects the customer's browser to after payment reaches a
 * terminal state. It is a GET (browser) call — never trusted for payment state;
 * the /api/cashfree/verify route re-checks with Cashfree's server.
 */
export function getCashfreeReturnUrl(): string {
  const explicit = process.env.CASHFREE_RETURN_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return `${getSiteOrigin()}/payment/cashfree/status`;
}

/**
 * Full URL Cashfree POSTs payment webhooks to. Server-to-server, so it must be
 * publicly reachable (deployed URL or a tunnel in sandbox).
 */
export function getCashfreeWebhookUrl(): string {
  const explicit = process.env.CASHFREE_WEBHOOK_URL;
  if (explicit) return explicit;
  return `${getSiteOrigin()}/api/cashfree/webhook`;
}

// ─── Order Creation ──────────────────────────────────────────────────────────

export interface CreateCashfreeOrderParams {
  orderId: string; // our unique order number — becomes Cashfree's order_id
  amount: number; // in paise (Rs. 100 = 10000)
  currency?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  // Restrict the checkout to the payment methods we support:
  // UPI, Cards, Net Banking and Wallets.
  paymentMethods?: string[];
}

export interface CreateCashfreeOrderResult {
  success: boolean;
  code: string;
  message: string;
  orderId?: string; // our order_id (echoed by Cashfree)
  cfOrderId?: string; // Cashfree's own order reference
  paymentSessionId?: string;
  orderStatus?: string;
}

/**
 * Create an order at Cashfree. Returns the `payment_session_id` that the
 * client SDK uses to render the checkout. Prices are always computed
 * server-side by the caller and passed here as `amount` — never from the client.
 */
export async function createCashfreeOrder(
  params: CreateCashfreeOrderParams,
): Promise<CreateCashfreeOrderResult> {
  const cashfree = getCashfree();
  if (!cashfree) {
    return {
      success: false,
      code: "CONFIG_ERROR",
      message:
        "Cashfree is not configured. Set CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET, and NEXT_PUBLIC_CASHFREE_ENV.",
    };
  }

  const request = {
    order_id: params.orderId,
    order_amount: params.amount,
    order_currency: params.currency ?? "INR",
    customer_details: {
      customer_id: params.orderId,
      customer_phone: params.customerPhone ?? "",
      customer_email: params.customerEmail,
      customer_name: params.customerName,
    },
    order_meta: {
      return_url: getCashfreeReturnUrl(),
      notify_url: getCashfreeWebhookUrl(),
      payment_methods: params.paymentMethods ?? ["upi", "card", "netbanking", "wallet"],
    },
  };

  try {
    const response = await cashfree.PGCreateOrder(request);
    const order = response.data;

    return {
      success: true,
      code: "OK",
      message: "Order created.",
      orderId: order.order_id,
      cfOrderId: order.cf_order_id,
      paymentSessionId: order.payment_session_id,
      orderStatus: order.order_status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      code: "API_ERROR",
      message: `Cashfree order creation failed: ${message}`,
    };
  }
}

// ─── Order Fetch / Status ────────────────────────────────────────────────────

export interface CashfreeOrderDetails {
  orderId?: string; // merchant order_id
  cfOrderId?: string;
  orderStatus?: string;
  orderAmount?: number;
  orderCurrency?: string;
  payments: Array<{
    cfPaymentId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentGroup?: string;
    paymentTime?: string;
    bankReference?: string;
    authId?: string;
    pgTransactionId?: string;
  }>;
}

/**
 * Fetch the authoritative order + payments state from Cashfree. This is what
 * the verify route and admin flows rely on — never the browser's return URL.
 */
export async function fetchCashfreeOrder(orderId: string): Promise<{
  success: boolean;
  message: string;
  order?: CashfreeOrderDetails;
}> {
  const cashfree = getCashfree();
  if (!cashfree) {
    return { success: false, message: "Cashfree is not configured." };
  }

  try {
    const response = await cashfree.PGFetchOrder(orderId);
    const order = response.data as CashfreeOrderPayload;

    return {
      success: true,
      message: "OK",
      order: {
        orderId: order.order_id,
        cfOrderId: order.cf_order_id,
        orderStatus: order.order_status,
        orderAmount: order.order_amount,
        orderCurrency: order.order_currency,
        payments: (order.payments ?? []).map((p) => ({
          cfPaymentId: p.cf_payment_id,
          paymentStatus: p.payment_status,
          paymentMethod: p.payment_method,
          paymentGroup: p.payment_group,
          paymentTime: p.payment_time,
          bankReference: p.bank_reference,
          authId: p.auth_id,
          // The PG transaction reference is not part of the SDK types but is
          // returned by the API on some payment groups; fall back to the
          // Cashfree payment id, which is always present.
          pgTransactionId: (p as { pg_transaction_id?: string }).pg_transaction_id,
        })),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Cashfree order fetch failed: ${message}` };
  }
}

// ─── Webhook Signature Verification ──────────────────────────────────────────

export interface CashfreeWebhookEvent {
  type: string; // e.g. PAYMENT_SUCCESS_WEBHOOK
  orderId?: string; // merchant order_id
  cfOrderId?: string;
  orderStatus?: string;
  payment?: {
    cfPaymentId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentGroup?: string;
    paymentTime?: string;
    bankReference?: string;
    authId?: string;
    pgTransactionId?: string;
  };
}

/**
 * Verify a Cashfree webhook signature before touching any order.
 *
 * The SDK computes `base64(HMAC-SHA256(clientSecret, timestamp + rawBody))`
 * and compares it to the `x-webhook-signature` header, throwing on mismatch.
 * Returns the parsed event only when the signature is valid — callers must
 * NOT process the payload otherwise.
 */
export function verifyCashfreeWebhookSignature(
  signature: string | null,
  rawBody: string,
  timestamp: string | null,
): CashfreeWebhookEvent | null {
  const cashfree = getCashfree();
  if (!cashfree || !signature || !timestamp) {
    return null;
  }

  try {
    const event = cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    const payload = event.object as {
      order?: CashfreeOrderPayload;
      payment?: Partial<PaymentEntity> & { payment_method?: string };
      payment_gateway_details?: { pg_transaction_id?: string };
    };

    return {
      type: event.type,
      orderId: payload.order?.order_id,
      cfOrderId: payload.order?.cf_order_id,
      orderStatus: payload.order?.order_status,
      payment: {
        cfPaymentId: payload.payment?.cf_payment_id,
        paymentStatus: payload.payment?.payment_status,
        paymentMethod: payload.payment?.payment_method,
        paymentGroup: payload.payment?.payment_group,
        paymentTime: payload.payment?.payment_time,
        bankReference: payload.payment?.bank_reference,
        authId: payload.payment?.auth_id,
        pgTransactionId: payload.payment_gateway_details?.pg_transaction_id,
      },
    };
  } catch {
    return null;
  }
}

// ─── Status Mapping ──────────────────────────────────────────────────────────

/**
 * Map a Cashfree order/payment status to our PaymentStatus.
 * SUCCESS (paid), PENDING/ACTIVE/EXPIRED-without-success (pending), else failed.
 */
export function mapCashfreeStatus(orderStatus?: string, paymentStatus?: string): "PAID" | "FAILED" | "PENDING" {
  const order = (orderStatus || "").toUpperCase();
  const payment = (paymentStatus || "").toUpperCase();

  if (order === "PAID" || payment === "SUCCESS") {
    return "PAID";
  }
  if (payment === "FAILED" || payment === "USER_DROPPED" || order === "EXPIRED" || order === "TERMINATED") {
    return "FAILED";
  }
  return "PENDING";
}

/** Human-readable webhook event handling key for logging. */
export const CASHFREE_PAYMENT_EVENTS = [
  "PAYMENT_SUCCESS_WEBHOOK",
  "PAYMENT_FAILED_WEBHOOK",
  "PAYMENT_USER_DROPPED_WEBHOOK",
] as const;

// ─── Order State Application (shared by verify + webhook) ───────────────────

export interface CashfreePaymentApplication {
  paymentStatus: "PAID" | "FAILED" | "PENDING";
  cashfreeOrderId?: string | null;
  cashfreePaymentId?: string | null;
  cashfreePaymentStatus?: string | null;
  cashfreeTransactionId?: string | null;
}

type PrismaOrderWithItems = {
  id: string;
  orderNumber: string;
  userId: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  payment: string;
  paymentStatus: string;
  cashfreePaymentId: string | null;
  cashfreeTransactionId: string | null;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
  createdAt: Date;
  items: Array<{ productId: number; quantity: number }>;
};

/**
 * Apply a verified Cashfree payment result to the DB order, idempotently.
 *
 * Rules:
 *  - Resolves the order by our order number (== Cashfree's order_id).
 *  - NEVER downgrades a PAID order based on a late/failed webhook or status check.
 *  - Re-applying the same payment id is a no-op (Cashfree retries webhooks).
 *  - Fires order-confirmation notifications only when transitioning PENDING → PAID.
 *
 * Returns the updated order (with items) when changed.
 */
export async function applyCashfreePaymentResult({
  orderNumber,
  application,
}: {
  orderNumber: string;
  application: CashfreePaymentApplication;
}): Promise<{
  status: "updated" | "noop" | "not-found";
  order?: PrismaOrderWithItems;
}> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) {
    return { status: "not-found" };
  }

  const wasPaid = order.paymentStatus === "PAID";

  // Never downgrade a paid order (e.g. a late USER_DROPPED webhook).
  if (wasPaid && application.paymentStatus !== "PAID") {
    return { status: "noop" };
  }

  // Idempotency: same payment already recorded — nothing to change.
  if (
    wasPaid &&
    application.cashfreePaymentId &&
    order.cashfreePaymentId === application.cashfreePaymentId
  ) {
    return { status: "noop" };
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: application.paymentStatus as "PENDING" | "PAID" | "FAILED" | "REFUNDED",
      cashfreeOrderId: application.cashfreeOrderId ?? order.cashfreeOrderId,
      cashfreePaymentId: application.cashfreePaymentId ?? order.cashfreePaymentId,
      cashfreePaymentStatus: application.cashfreePaymentStatus ?? order.cashfreePaymentStatus,
      cashfreeTransactionId: application.cashfreeTransactionId ?? order.cashfreeTransactionId,
    },
    include: { items: true },
  });

  // Notify only on the PENDING → PAID transition (idempotent for retries).
  if (application.paymentStatus === "PAID" && !wasPaid) {
    const user = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { email: true },
    });

    const items: CartItem[] = updated.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    notifyOrderConfirmed({
      orderNumber: updated.orderNumber,
      userId: updated.userId,
      recipientName: updated.recipientName,
      phone: updated.phone,
      email: user?.email ?? "",
      address: updated.addressLine,
      city: updated.city,
      pincode: updated.pincode,
      items,
      subtotal: updated.subtotal,
      deliveryFee: updated.deliveryFee,
      discount: updated.discount,
      total: updated.total,
      payment: updated.payment,
      paymentStatus: "PAID",
      cashfreeTransactionId: application.cashfreeTransactionId ?? undefined,
      createdAt: updated.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    }).catch(() => {});
  }

  return { status: "updated", order: updated };
}
