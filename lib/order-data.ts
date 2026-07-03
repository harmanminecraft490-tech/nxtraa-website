import { Prisma, OrderStatus } from "@prisma/client";

import { getProductById } from "@/app/components/lib/products";
import { DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_NAME } from "@/lib/demo-account";
import prisma from "@/lib/prisma";
import type { CartItem } from "@/app/components/lib/cartcontext";
import type { Order, OrderAddress } from "@/app/components/lib/orders";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

function mapStatus(status: OrderStatus): Order["status"] {
  return status;
}

export function generateOrderNumber() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `NX-${new Date().getFullYear()}-${num}`;
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
    total: order.total,
    payment: order.payment,
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

export async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_ACCOUNT_EMAIL },
    update: { name: DEMO_ACCOUNT_NAME },
    create: {
      name: DEMO_ACCOUNT_NAME,
      email: DEMO_ACCOUNT_EMAIL,
    },
  });
}

export async function createOrderForUser({
  userId,
  items,
  subtotal,
  deliveryFee,
  total,
  payment,
  address,
}: {
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: string;
  address: OrderAddress;
}) {
  let orderNumber = generateOrderNumber();
  const pricedItems = items.map((item) => ({
    ...item,
    unitPrice: getProductById(item.productId).price,
  }));

  while (await prisma.order.findUnique({ where: { orderNumber } })) {
    orderNumber = generateOrderNumber();
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      subtotal,
      deliveryFee,
      total,
      payment,
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

export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
    },
  });

  return order ? mapOrder(order) : null;
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
