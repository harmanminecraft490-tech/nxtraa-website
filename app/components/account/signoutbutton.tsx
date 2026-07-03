"use client";

import { useState, useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";

type SignOutButtonProps = {
  className?: string;
  compact?: boolean;
  onComplete?: () => void;
};

export default function SignOutButton({
  className,
  compact = false,
  onComplete,
}: SignOutButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSignOut = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          setError("Could not sign you out. Please try again.");
          return;
        }

        onComplete?.();
        window.location.href = "/account/signin";
      } catch {
        setError("Could not sign you out. Please try again.");
      }
    });
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className={
          compact
            ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink-950 transition hover:border-ink-950 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
            : "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-bold text-ink-950 transition hover:border-ink-950 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
        <span>{pending ? "Signing out..." : "Sign out"}</span>
      </button>

      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
