"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_NAME } from "@/lib/demo-account";

type ProfileMenuProps = {
  mobile?: boolean;
  onAction?: () => void;
};

export default function ProfileMenu({
  mobile = false,
  onAction,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const accountLabel = DEMO_ACCOUNT_NAME;
  const accountSubLabel = DEMO_ACCOUNT_EMAIL;
  const accountInitial = accountLabel.charAt(0).toUpperCase();

  if (mobile) {
    return (
      <div className="space-y-3 rounded-3xl bg-canvas p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
            {accountInitial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink-950">{accountLabel}</p>
            <p className="truncate text-xs text-ink-500">{accountSubLabel}</p>
          </div>
        </div>

        <div className="grid gap-2">
          <Link
            href="/account"
            onClick={onAction}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink-900"
          >
            Profile account
          </Link>
          <Link
            href="/track-order"
            onClick={onAction}
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold text-ink-900"
          >
            Track order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-mist hover:text-accent"
        aria-label="Account menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
          {accountInitial}
        </span>
        <span className="max-w-28 truncate text-sm font-semibold text-ink-700">
          {accountLabel}
        </span>
        <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-label="Close account menu"
          />
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-3xl border border-line bg-white p-3 shadow-xl">
            <div className="rounded-2xl bg-canvas p-4">
              <p className="truncate text-sm font-bold text-ink-950">{accountLabel}</p>
              <p className="truncate text-xs text-ink-500">{accountSubLabel}</p>
            </div>

            <div className="mt-3 grid gap-2">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-ink-900 transition hover:bg-canvas"
              >
                Profile account
              </Link>
              <Link
                href="/track-order"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-ink-900 transition hover:bg-canvas"
              >
                Track order
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
