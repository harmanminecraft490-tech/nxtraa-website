/**
 * Modular notification system.
 *
 * After a successful order, notifications are sent via all configured channels.
 * Each channel is independent and fails silently — a failed email should never
 * prevent an order from succeeding.
 *
 * Channels:
 *   1. Email (SMTP via fetch to a mail API, or Nodemailer)
 *   2. WhatsApp (Cloud API — existing in lib/notify.ts)
 *   3. SMS (Twilio or any provider)
 *
 * To add a new channel, implement `sendXxx` and register it in `notifyOrderConfirmed`.
 */

import type { CartItem } from "@/app/components/lib/cartcontext";
import { getAllProductsCached } from "@/app/components/lib/products-cache";
import { notifyNewOrder } from "./notify";

export type OrderNotificationData = {
  orderNumber: string;
  userId: string;
  recipientName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  payment: string;
  paymentStatus: string;
  phonepeTransactionId?: string;
  createdAt: string;
};

// ─── Product Name Resolution ────────────────────────────────────────────────

async function resolveProductNames(
  items: CartItem[],
): Promise<Array<{ name: string; quantity: number; price: number }>> {
  const products = await getAllProductsCached();
  const productMap = new Map(products.map((p) => [p.id, p]));

  return items.map((item) => {
    const product = productMap.get(item.productId);
    return {
      name: product?.title ?? `Product #${item.productId}`,
      quantity: item.quantity,
      price: product?.price ?? 0,
    };
  });
}

// ─── Email Channel ──────────────────────────────────────────────────────────

function buildOrderEmailHtml(data: OrderNotificationData, products: Array<{ name: string; quantity: number; price: number }>): string {
  const productRows = products
    .map(
      (p) =>
        `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;">${p.name}</td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${p.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;text-align:right;">₹${(p.price * p.quantity).toLocaleString("en-IN")}</td>
        </tr>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:20px;margin-bottom:20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#06b6d4,#0891b2);padding:32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">Order Confirmed!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Thank you for shopping with Nxteraa</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="font-size:16px;color:#1a1a2e;margin:0 0 24px;">Hi ${data.recipientName},</p>
      <p style="font-size:14px;color:#555;margin:0 0 24px;">Your order has been confirmed and is being prepared for dispatch.</p>

      <!-- Order Details -->
      <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#888;">Order Number</td>
            <td style="padding:6px 0;font-size:13px;color:#1a1a2e;font-weight:700;text-align:right;">${data.orderNumber}</td>
          </tr>
          ${data.phonepeTransactionId ? `<tr>
            <td style="padding:6px 0;font-size:13px;color:#888;">Transaction ID</td>
            <td style="padding:6px 0;font-size:13px;color:#1a1a2e;font-weight:700;text-align:right;">${data.phonepeTransactionId}</td>
          </tr>` : ""}
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#888;">Payment Method</td>
            <td style="padding:6px 0;font-size:13px;color:#1a1a2e;font-weight:700;text-align:right;">${data.payment}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#888;">Date</td>
            <td style="padding:6px 0;font-size:13px;color:#1a1a2e;font-weight:700;text-align:right;">${data.createdAt}</td>
          </tr>
        </table>
      </div>

      <!-- Products -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #eee;">Product</th>
            <th style="text-align:center;padding:8px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #eee;">Qty</th>
            <th style="text-align:right;padding:8px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #eee;">Total</th>
          </tr>
        </thead>
        <tbody>${productRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="border-top:2px solid #eee;padding-top:16px;">
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#888;">
          <span>Subtotal</span><span>₹${data.subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#888;">
          <span>Delivery</span><span>${data.deliveryFee === 0 ? "Free" : `₹${data.deliveryFee}`}</span>
        </div>
        ${data.discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#22c55e;">
          <span>Discount</span><span>-₹${data.discount.toLocaleString("en-IN")}</span>
        </div>` : ""}
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:18px;font-weight:800;color:#1a1a2e;border-top:2px solid #eee;margin-top:8px;">
          <span>Total Paid</span><span>₹${data.total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <!-- Shipping Address -->
      <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-top:24px;">
        <p style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;font-weight:700;">Shipping To</p>
        <p style="font-size:14px;color:#1a1a2e;margin:0;line-height:1.6;">
          ${data.recipientName}<br/>
          ${data.address}<br/>
          ${data.city} – ${data.pincode}<br/>
          Phone: ${data.phone}
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:32px;">
        <a href="https://nxtraa.online/track-order?id=${encodeURIComponent(data.orderNumber)}"
           style="display:inline-block;background:#06b6d4;color:#ffffff;padding:14px 32px;border-radius:9999px;font-size:14px;font-weight:700;text-decoration:none;">
          Track Your Order
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #eee;">
      <p style="font-size:12px;color:#888;margin:0;">Nxteraa · Premium Mobile Accessories</p>
      <p style="font-size:12px;color:#888;margin:8px 0 0;">
        <a href="https://nxtraa.online/support" style="color:#06b6d4;text-decoration:none;">Need help? Contact support</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function sendOrderEmail(data: OrderNotificationData): Promise<boolean> {
  // Email is sent from the business owner's address to the customer.
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const toEmail = data.email || data.recipientName; // fallback to name if no email
  const smtpHost = process.env.SMTP_HOST;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPass || !fromEmail || !toEmail || !toEmail.includes("@")) {
    // Email not configured or no customer email — skip silently.
    return false;
  }

  try {
    const products = await resolveProductNames(data.items);
    const html = buildOrderEmailHtml(data, products);

    // Use a generic SMTP-over-HTTPS API or direct SMTP.
    // For production, integrate with Resend, SendGrid, or similar.
    // Using a simple fetch-based approach for flexibility.
    const response = await fetch(`${smtpHost}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject: `Order Confirmed – ${data.orderNumber} | Nxteraa`,
        html,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Email notification error:", error);
    return false;
  }
}

// ─── Main Dispatcher ────────────────────────────────────────────────────────

/**
 * Send order confirmation notifications via all configured channels.
 * Called after a successful order. Never throws — all channels fail silently.
 */
export async function notifyOrderConfirmed(data: OrderNotificationData): Promise<void> {
  // Fire all notification channels in parallel.
  // Each channel is independent; a failure in one does not affect others.
  const tasks: Promise<boolean>[] = [];

  // 1. WhatsApp (existing system — notifies the business owner)
  tasks.push(
    notifyNewOrder({
      orderNumber: data.orderNumber,
      recipientName: data.recipientName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      items: data.items,
      payment: data.payment,
      paymentStatus: data.paymentStatus,
      createdAt: data.createdAt,
    })
      .then(() => true)
      .catch(() => false),
  );

  // 2. Email (sends to the customer)
  tasks.push(sendOrderEmail(data));

  // 3. SMS — placeholder for future implementation
  // tasks.push(sendOrderSms(data));

  await Promise.allSettled(tasks);
}
