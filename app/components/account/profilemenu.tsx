"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, User } from "lucide-react";

import SignOutButton from "./signoutbutton";

type ProfileMenuProps = {
  mobile?: boolean;
  onAction?: () => void;
};

type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function ProfileMenu({
  mobile = false,
  onAction,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok || cancelled) {
          return;
        }

        const data = (await response.json()) as { user: SessionUser | null };
        if (!cancelled) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCheckedAuth(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const accountLabel = user?.name?.trim() || user?.email || "My account";
  const accountSubLabel = user?.email || "Sign in to track orders";
  const accountInitial = useMemo(() => {
    const source = accountLabel.trim();
    return source.charAt(0).toUpperCase() || "A";
  }, [accountLabel]);

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

        {user ? (
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
            <SignOutButton compact onComplete={onAction} />
          </div>
        ) : (
          <div className="grid gap-2">
            <Link
              href="/account/signin"
              onClick={onAction}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink-900"
            >
              Sign in
            </Link>
            <Link
              href="/account/signin?mode=register"
              onClick={onAction}
              className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold text-ink-900"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (checkedAuth && !user) {
    return (
      <Link
        href="/account/signin"
        className="hidden min-h-11 items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-ink-950 hover:text-ink-950 md:inline-flex"
      >
        <User size={16} />
        <span>Sign in</span>
      </Link>
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
              <div className="px-1 pt-1">
                <SignOutButton compact onComplete={() => setOpen(false)} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
