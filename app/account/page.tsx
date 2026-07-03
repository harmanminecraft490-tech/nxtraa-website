"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../authcontext";

export default function AccountPage() {
  const { isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="page-wrap flex items-center justify-center py-20">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-wrap flex flex-col items-center justify-center py-20">
      <h1 className="h-section text-center">My Account</h1>

      <p className="mb-8 text-center text-gray-600">
        Welcome! You are successfully logged in.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="btn btn-primary"
        >
          🛍️ Continue Shopping
        </Link>

        <button
          onClick={logout}
          className="btn btn-secondary"
        >
          Logout
        </button>
      </div>
    </div>
  );
}