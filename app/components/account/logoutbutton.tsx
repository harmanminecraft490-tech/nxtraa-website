"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await signOut({ callbackUrl: "/account" });
        });
      }}
      className="rounded-full border border-accent bg-white px-5 py-2.5 text-sm font-bold text-accent transition-all duration-300 hover:bg-accent hover:text-white hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
