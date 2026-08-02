import { Prisma, OrderStatus } from "@prisma/client";

import { getDeliveryFee } from "@/app/components/lib/product-types";
import { getAllProductsCached } from "@/app/components/lib/products-cache";
import prisma from "@/lib/prisma";
import type { CartItem } from "@/app/components/lib/cartcontext";
import type { Order, OrderAddress } from "@/app/components/lib/orders";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

/** True when `items` is a non-empty list of { productId:number, quantity:number>0 }. */
export function isValidCartItems(items: unknown): items is CartItem[] {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as CartItem).productId === "number" &&
      typeof (item as CartItem).quantity === "number" &&
      (item as CartItem).quantity > 0,
  );
}

/**
 * Authoritative, server-side order pricing. Prices come from the catalog — never
 * from the client — so a tampered request cannot change what is charged.
 * Shared by /api/orders and /api/cashfree/orders so both always agree.
 */
export async function computeCartPricing(items: CartItem[]) {
  const products = await getAllProductsCached();
  const priceMap = new Map(products.map((p) => [p.id, p.price]));
  const subtotal = items.reduce(
    (sum, item) => sum + (priceMap.get(item.productId) ?? 0) * item.quantity,
    0,
  );
  const deliveryFee = getDeliveryFee(subtotal);
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

function mapStatus(status: OrderStatus): Order["status"] {
  return status;
}

export function generateOrderNumber() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `NX-${new Date().getFullYear()}-${num}`;
}

/**
 * Generate an order number guaranteed not to collide with an existing order.
 * Callers that need the number before the order exists (e.g. to pass the same
 * value to Cashfree as `order_id`) use this.
 */
export async function generateUniqueOrderNumber(): Promise<string> {
  let orderNumber = generateOrderNumber();
  while (await prisma.order.findUnique({ where: { orderNumber } })) {
    orderNumber = generateOrderNumber();
  }
  return orderNumber;
}

export function mapOrder(order: OrderWithItems): Order {
  return {
    id: order.orderNumber,
    items: order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })) as CartItem[],
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    payment: order.payment,
    paymentStatus: order.paymentStatus as Order["paymentStatus"],
    cashfreeOrderId: order.cashfreeOrderId,
    cashfreePaymentId: order.cashfreePaymentId,
    cashfreePaymentStatus: order.cashfreePaymentStatus,
    cashfreeTransactionId: order.cashfreeTransactionId,
    currency: order.currency,
    address: {
      name: order.recipientName,
      phone: order.phone,
      address: order.addressLine,
      city: order.city,
      pincode: order.pincode,
    },
    status: mapStatus(order.status),
    createdAt: order.createdAt.toISOString(),
  };
}

export async function createOrderForUser({
  userId,
  items,
  subtotal,
  deliveryFee,
  total,
  payment,
  address,
  paymentStatus = "PENDING",
  cashfreeOrderId,
  cashfreePaymentId,
  cashfreePaymentStatus,
  cashfreeTransactionId,
  orderNumber,
  discount = 0,
}: {
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: string;
  address: OrderAddress;
  paymentStatus?: string;
  cashfreeOrderId?: string | null;
  cashfreePaymentId?: string | null;
  cashfreePaymentStatus?: string | null;
  cashfreeTransactionId?: string | null;
  orderNumber?: string;
  discount?: number;
}) {
  // Fetch all products to get their prices for the order items.
  const products = await getAllProductsCached();
  const productPriceMap = new Map(products.map((p) => [p.id, p.price]));

  const finalOrderNumber = orderNumber ?? (await generateUniqueOrderNumber());
  const pricedItems = items.map((item) => ({
    ...item,
    unitPrice: productPriceMap.get(item.productId) ?? 0,
  }));

  const order = await prisma.order.create({
    data: {
      orderNumber: finalOrderNumber,
      userId,
      subtotal,
      deliveryFee,
      total,
      discount,
      payment,
      paymentStatus: paymentStatus as "PENDING" | "PAID" | "FAILED" | "REFUNDED",
      cashfreeOrderId: cashfreeOrderId ?? null,
      cashfreePaymentId: cashfreePaymentId ?? null,
      cashfreePaymentStatus: cashfreePaymentStatus ?? null,
      cashfreeTransactionId: cashfreeTransactionId ?? null,
      recipientName: address.name,
      phone: address.phone,
      addressLine: address.address,
      city: address.city,
      pincode: address.pincode,
      items: {
        create: pricedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return mapOrder(order);
}

export async function getOrderByNumberForUser(orderNumber: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
    },
  });

  if (!order || order.userId !== userId) return null;

  return mapOrder(order);
}

export async function getOrdersForUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map(mapOrder);
}
