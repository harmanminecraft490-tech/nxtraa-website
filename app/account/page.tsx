import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";

import Link from "next/link";

import SignOutButton from "./components/account/signoutbutton";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/account/signin?next=/account");
  }

  return (
    <div className="page-wrap flex flex-col items-center justify-center py-20">
      <h1 className="h-section text-center">My Account</h1>

      <p className="mb-8 text-center text-gray-600">
        Welcome! You are successfully logged in.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/shop"
          className="btn btn-primary"
        >
          🛍️ Continue Shopping
        </Link>

        <SignOutButton />
      </div>
    </div>
  );
}

