"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import type { FieldErrors } from "@/lib/auth/validation";

type Mode = "signin" | "register";

type SignInFormProps = {
  next: string;
  initialMode: Mode;
};

type AuthSuccess = {
  user: { id: string; name: string | null; email: string | null };
};

type AuthFailure = {
  error: string;
  fieldErrors?: FieldErrors;
};

export default function SignInForm({ next, initialMode }: SignInFormProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  const isRegister = mode === "register";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload: Record<string, string | boolean> = { email, password, remember };
    if (isRegister) payload.name = name;

    startTransition(async () => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data: AuthSuccess | AuthFailure = await response
          .json()
          .catch(() => ({ error: "Something went wrong. Please try again." }));

        if (!response.ok) {
          const failure = data as AuthFailure;
          setFormError(failure.error ?? "Something went wrong. Please try again.");
          if (failure.fieldErrors) {
            setFieldErrors(failure.fieldErrors);
          }
          return;
        }

        // Hard navigate so the server re-renders with the new session cookie.
        window.location.href = next || "/account";
      } catch (error) {
        console.error("Auth request failed:", error);
        setFormError("Network error. Please check your connection and try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {isRegister ? (
        <div>
          <label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-[0.2em] text-ink-500"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={pending}
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base font-semibold text-ink-950 outline-none transition focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10 disabled:opacity-60"
            placeholder="Your name"
          />
          {fieldErrors.name ? (
            <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.name}</p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="text-xs font-bold uppercase tracking-[0.2em] text-ink-500"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base font-semibold text-ink-950 outline-none transition focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10 disabled:opacity-60"
          placeholder="you@example.com"
        />
        {fieldErrors.email ? (
          <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-[0.2em] text-ink-500"
          >
            Password
          </label>
          <Link href="/support" className="text-xs font-semibold text-ink-500 hover:text-ink-950">
            Need help?
          </Link>
        </div>
        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 pr-12 text-base font-semibold text-ink-950 outline-none transition focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10 disabled:opacity-60"
            placeholder={isRegister ? "At least 8 characters" : "Your password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-500 transition hover:bg-mist hover:text-ink-950"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password ? (
          <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.password}</p>
        ) : null}
      </div>

      <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-line-soft bg-canvas px-4 py-3 text-sm font-semibold text-ink-700">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          disabled={pending}
          className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
        />
        <span>Keep me signed in on this device</span>
      </label>

      {formError || fieldErrors.form ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError ?? fieldErrors.form}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-block disabled:opacity-60"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            {isRegister ? "Creating account..." : "Signing in..."}
          </span>
        ) : isRegister ? (
          "Create account"
        ) : (
          "Sign in"
        )}
      </button>

      <div className="relative my-2 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
        <span className="h-px flex-1 bg-line" />
        <span>or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={() => {
          setFormError(null);
          setFieldErrors({});
          setMode(isRegister ? "signin" : "register");
        }}
        className="btn btn-block border border-line bg-white text-ink-950 hover:border-ink-950"
      >
        {isRegister
          ? "I already have an account - Sign in"
          : "New to Nxteraa - Create an account"}
      </button>

      <p className="text-center text-xs font-medium text-ink-500">
        <Link href="/" className="hover:text-ink-950">
          Continue shopping
        </Link>
      </p>
    </form>
  );
}

