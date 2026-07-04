import { redirect } from "next/navigation";
import Link from "next/link";

import { getSessionUser } from "@/lib/auth/session";

export default async function AccountPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/account/signin?next=/account");
  }

  return (
    <div className="page-wrap flex flex-col items-center justify-center py-20">
      <h1 className="h-section text-center">My Account</h1>

      <p className="mb-8 text-center text-gray-600">
        Welcome, {user.name ?? user.email ?? "User"}!
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/shop" className="btn btn-primary">
          🛍️ Continue Shopping
        </Link>

        <Link
          href="/api/auth/logout"
          className="btn btn-secondary"
        >
          Logout
        </Link>
      </div>
    </div>
  );
}