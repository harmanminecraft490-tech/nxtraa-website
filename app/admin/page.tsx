import { redirect } from "next/navigation";

import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/account/signin?next=/admin");
  }

  // Admin configuration must exist; otherwise show a clear configuration error.
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {

    return (
      <div className="page-wrap flex flex-col items-center justify-center py-20">
        <h1 className="h-section text-center">Admin configuration error</h1>
        <p className="mt-4 text-center text-gray-600">
          ADMIN_EMAIL is not configured. Ask the site administrator to set it in the runtime environment.
        </p>
      </div>
    );
  }


  if (!isAdminEmail(user.email)) {

    redirect("/account");
  }

  return <AdminClient />;
}

