import { redirect } from "next/navigation";

import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import AdminOrdersClient from "./admin-orders-client";

export default async function AdminOrdersPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/account/signin?next=/admin/orders");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/account");
  }

  return <AdminOrdersClient />;
}
