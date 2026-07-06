import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { getOrderByNumberForUser } from "@/lib/order-data";

type OrderRouteProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export async function GET(_request: Request, { params }: OrderRouteProps) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to view your order." }, { status: 401 });
  }

  const { orderNumber } = await params;
  // Scoped to the signed-in user — order numbers are guessable, so never
  // return another customer's order (it contains their address and phone).
  const order = await getOrderByNumberForUser(orderNumber, user.id);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
