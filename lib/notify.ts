/**
 * Order notification system.
 *
 * Sends order details to the business owner via WhatsApp after every
 * successful order. Uses environment variables for all credentials —
 * nothing is hardcoded.
 *
 * Required env vars:
 *   WHATSAPP_API_TOKEN   – Bearer token for the WhatsApp Cloud API
 *   WHATSAPP_PHONE_ID    – WhatsApp Business phone number ID
 *   WHATSAPP_TO_NUMBER   – Recipient phone number (without + prefix)
 *
 * Optional:
 *   WHATSAPP_API_VERSION – API version (default: "v21.0")
 *   WHATSAPP_ENABLED     – Set to "false" to disable notifications
 */

import type { CartItem } from "@/app/components/lib/cartcontext";
import type { OrderAddress } from "@/app/components/lib/orders";
import { getAllProductsCached } from "@/app/components/lib/products-cache";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

type NotificationPayload = {
  orderNumber: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  items: CartItem[];
  payment: string;
  paymentStatus: string;
  createdAt: string;
  notes?: string;
};

function isNotificationsEnabled(): boolean {
  return process.env.WHATSAPP_ENABLED !== "false";
}

function getWhatsAppConfig() {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const toNumber = process.env.WHATSAPP_TO_NUMBER;

  if (!token || !phoneId || !toNumber) {
    return null;
  }

  return {
    token,
    phoneId,
    toNumber,
    apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
  };
}

async function resolveProductNames(
  items: CartItem[],
): Promise<string[]> {
  const products = await getAllProductsCached();
  const productMap = new Map(products.map((p) => [p.id, p]));

  return items.map((item) => {
    const product = productMap.get(item.productId);
    const name = product?.title ?? `Product #${item.productId}`;
    return `• ${name} (Qty: ${item.quantity})`;
  });
}

function formatNotification(
  payload: NotificationPayload,
  productLines: string[],
): string {
  const productSection = productLines.join("\n");

  return [
    `🛍️ *New Order – ${payload.orderNumber}*`,
    ``,
    `👤 *Customer:* ${payload.recipientName}`,
    `📞 *Phone:* ${payload.phone}`,
    `📍 *Address:* ${payload.address}, ${payload.city} – ${payload.pincode}`,
    ``,
    `📦 *Products:*`,
    productSection,
    ``,
    `💳 *Payment:* ${payload.payment} (${payload.paymentStatus})`,
    `🕐 *Time:* ${payload.createdAt}`,
    payload.notes ? `📝 *Notes:* ${payload.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendWhatsAppMessage(
  config: { token: string; phoneId: string; toNumber: string; apiVersion: string },
  message: string,
): Promise<boolean> {
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: config.toNumber,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("WhatsApp API error:", response.status, errorBody);
    return false;
  }

  return true;
}

async function sendWithRetry(
  config: { token: string; phoneId: string; toNumber: string; apiVersion: string },
  message: string,
): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const success = await sendWhatsAppMessage(config, message);
    if (success) return true;

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
  return false;
}

/**
 * Send order notification to the business owner.
 * Fails silently — never blocks order creation.
 */
export async function notifyNewOrder(payload: NotificationPayload): Promise<void> {
  if (!isNotificationsEnabled()) return;

  const config = getWhatsAppConfig();
  if (!config) {
    console.warn(
      "WhatsApp notifications not configured. Set WHATSAPP_API_TOKEN, WHATSAPP_PHONE_ID, and WHATSAPP_TO_NUMBER.",
    );
    return;
  }

  try {
    const productLines = await resolveProductNames(payload.items);
    const message = formatNotification(payload, productLines);

    const sent = await sendWithRetry(config, message);
    if (!sent) {
      console.error(`Failed to send order notification for ${payload.orderNumber} after ${MAX_RETRIES} attempts`);
    }
  } catch (error) {
    // Never crash the order flow
    console.error("Order notification error:", error);
  }
}
