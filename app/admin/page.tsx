import { redirect } from "next/navigation";

import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/account/signin?next=/admin");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/account");
  }

  return <AdminClient />;
}
