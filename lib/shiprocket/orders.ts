import prisma from "@/lib/prisma";
import { shiprocketRequest } from "./client";
import { shiprocketConfig } from "../config/shiprocket";

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string; // YYYY-MM-DD HH:MM
  pickup_location: string;
  channel_id?: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: string;
    discount?: string;
    tax?: string;
    hsn?: string;
  }>;
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export async function createShiprocketOrder(orderId: string): Promise<any> {
  const order = await prisma.order.findUnique({
    where: { orderNumber: orderId },
    include: { items: true, user: true },
  });

  if (!order) throw new Error("Order not found");

  // Get products to populate dimensions
  const productIds = order.items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  let totalWeight = 0;
  let maxLength = 10;
  let maxWidth = 10;
  let maxHeight = 10;

  const orderItems = order.items.map(item => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    // Aggregate dimensions
    totalWeight += (product.weight || 0.5) * item.quantity;
    maxLength = Math.max(maxLength, product.length || 10);
    maxWidth = Math.max(maxWidth, product.width || 10);
    // Simple stacking for height
    maxHeight += (product.height || 10) * item.quantity;

    return {
      name: product.title,
      sku: product.model || `SKU-${product.id}`,
      units: item.quantity,
      selling_price: (item.unitPrice / 100).toString(),
      hsn: product.hsnCode || undefined,
    };
  });

  // Convert order date to YYYY-MM-DD HH:MM
  const orderDate = new Date(order.createdAt).toISOString().replace(/T/, ' ').substring(0, 16);

  // Validate address (basic)
  if (!order.addressLine || !order.city || !order.pincode) {
    throw new Error("Incomplete shipping address");
  }

  const payload: ShiprocketOrderPayload = {
    order_id: order.orderNumber,
    order_date: orderDate,
    pickup_location: shiprocketConfig.pickupLocation,
    billing_customer_name: order.recipientName.split(" ")[0] || "Customer",
    billing_last_name: order.recipientName.split(" ").slice(1).join(" ") || ".",
    billing_address: order.addressLine,
    billing_city: order.city,
    billing_pincode: order.pincode,
    billing_state: "Delhi", // Default or extract from address - Shiprocket handles auto-mapping based on pincode mostly, but state is required. Ideally we need a state field. We will use a default or derive it. For now, "Delhi".
    billing_country: "India",
    billing_email: order.user?.email || "customer@nxteraa.online",
    billing_phone: order.phone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.payment.toLowerCase() === "cod" ? "COD" : "Prepaid",
    sub_total: order.total / 100,
    length: maxLength,
    breadth: maxWidth,
    height: maxHeight,
    weight: totalWeight,
  };

  const response = await shiprocketRequest("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Log creation
  await prisma.shipmentLog.create({
    data: {
      orderId: order.id,
      action: "Shiprocket Order Created",
      details: response,
    }
  });

  return response;
}
