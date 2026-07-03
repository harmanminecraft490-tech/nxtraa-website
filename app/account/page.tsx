"use client";

import { useEffect } from "react";
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
    // You can show a loading spinner here
    return <div className="page-wrap text-center">Loading...</div>;
  }

  return (
    <div className="page-wrap flex flex-col items-center justify-center">
      <h1 className="h-section text-center">My Account</h1>
      <p className="mb-8">Welcome! You are successfully logged in.</p>
      <button onClick={logout} className="btn btn-secondary">
        Logout
      </button>
    </div>
  );
}
