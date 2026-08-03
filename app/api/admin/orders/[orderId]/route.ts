import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

type RouteProps = {
  params: Promise<{
    orderId: string;
  }>;
};

// Check admin role
async function checkAdmin() {
  const user = await getSessionUser();
  if (!user || user.email !== "harmanminecraft490@gmail.com") {
    return false;
  }
  return true;
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    await prisma.order.delete({
      where: { id: orderId }
    });
    
    return NextResponse.json({ success: true, message: "Order deleted successfully." });
  } catch (error: any) {
    console.error(`[Admin] Failed to delete order ${orderId}:`, error);
    return NextResponse.json({ error: "Failed to delete order." }, { status: 500 });
  }
}
