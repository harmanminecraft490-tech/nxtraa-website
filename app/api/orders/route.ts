import { NextResponse } from "next/server";

import { auth } from "@/auth";
import type { CartItem } from "@/app/components/lib/cartcontext";
import type { OrderAddress } from "@/app/components/lib/orders";
import { getProductById } from "@/app/components/lib/products";
import { createOrderForUser, getOrdersForUser } from "@/lib/order-data";

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
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getOrdersForUser(session.user.id);

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

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
    userId: session.user.id,
    items,
    subtotal: computedSubtotal,
    deliveryFee: computedDeliveryFee,
    total: computedTotal,
    payment,
    address,
  });

  return NextResponse.json({ order }, { status: 201 });
}
