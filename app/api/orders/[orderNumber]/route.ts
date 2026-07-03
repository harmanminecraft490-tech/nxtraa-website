import { NextResponse } from "next/server";

import { getOrderByNumber } from "@/lib/order-data";

type OrderRouteProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export async function GET(_request: Request, { params }: OrderRouteProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
