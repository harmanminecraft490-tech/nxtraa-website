"use client";

import Link from "next/link";
import { LockKeyhole, User } from "lucide-react";

type AccountAuthShellProps = {
  redirectTo: string;
};

export default function AccountAuthShell({
  redirectTo,
}: AccountAuthShellProps) {
  return (
    <div className="rounded-[2rem] border border-line bg-white p-8 shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <User size={32} />
      </div>
      <h1 className="mt-6 text-3xl font-black text-ink-950">My account</h1>
      <p className="mt-2 text-ink-500">
        Sign-in is temporarily unavailable while authentication is disabled.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-canvas p-5 text-sm text-ink-600">
        <p className="font-bold text-ink-950">Temporary demo access</p>
        <p className="mt-2">
          You can continue shopping, place orders, and view the local demo account page without logging in.
        </p>
        <p className="mt-2">
          Requested destination: <span className="font-bold">{redirectTo}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/account"
          className="flex h-12 items-center justify-center rounded-xl bg-accent font-bold text-white transition hover:bg-cyan-500"
        >
          Open account
        </Link>
        <Link
          href={redirectTo}
          className="flex h-12 items-center justify-center rounded-xl border border-line font-bold text-ink-800 transition hover:bg-canvas"
        >
          Continue
        </Link>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl bg-accent-soft px-4 py-4 text-sm text-accent-900">
        <LockKeyhole size={18} className="mt-0.5 shrink-0" />
        <p>
          Google sign-in and OAuth are temporarily removed while the rest of the website remains available.
        </p>
      </div>
    </div>
  );
}
