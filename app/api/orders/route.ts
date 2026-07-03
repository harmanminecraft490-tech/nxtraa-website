import { NextResponse } from "next/server";

import type { CartItem } from "@/app/components/lib/cartcontext";
import type { OrderAddress } from "@/app/components/lib/orders";
import { getProductById } from "@/app/components/lib/products";
import { createOrderForUser, ensureDemoUser, getOrdersForUser } from "@/lib/order-data";

function isValidAddress(address: unknown): address is OrderAddress {
  if (!address || typeof address !== "object") {
    return false;
  }

  const candidate = address as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.phone === "string" &&
    typeof candidate.address === "string" &&
    typeof candidate.city === "string" &&
    typeof candidate.pincode === "string"
  );
}

function isValidItems(items: unknown): items is CartItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.productId === "number" &&
      typeof item.quantity === "number" &&
      item.quantity > 0,
  );
}

export async function GET() {
  // Authentication is temporarily disabled. Use demo user.
  const demoUser = await ensureDemoUser();
  const orders = await getOrdersForUser(demoUser.id);

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  // Authentication is temporarily disabled. Use demo user.
  const demoUser = await ensureDemoUser();

  const body = await request.json();
  const items = body.items;
  const address = body.address;
  const payment = String(body.payment ?? "");
  const subtotal = Number(body.subtotal ?? 0);
  const deliveryFee = Number(body.deliveryFee ?? 0);
  const total = Number(body.total ?? 0);

  if (!isValidItems(items) || !isValidAddress(address)) {
    return NextResponse.json({ error: "Order details are invalid." }, { status: 400 });
  }

  if (!payment) {
    return NextResponse.json({ error: "Select a payment method." }, { status: 400 });
  }

  const computedSubtotal = items.reduce(
    (sum, item) => sum + getProductById(item.productId).price * item.quantity,
    0,
  );
  const computedDeliveryFee = computedSubtotal >= 999 ? 0 : 99;
  const computedTotal = computedSubtotal + computedDeliveryFee;

  if (
    subtotal !== computedSubtotal ||
    deliveryFee !== computedDeliveryFee ||
    total !== computedTotal
  ) {
    return NextResponse.json({ error: "Order pricing is out of date." }, { status: 400 });
  }

  const order = await createOrderForUser({
    userId: demoUser.id,
    items,
    subtotal: computedSubtotal,
    deliveryFee: computedDeliveryFee,
    total: computedTotal,
    payment,
    address,
  });

  return NextResponse.json({ order }, { status: 201 });
}
