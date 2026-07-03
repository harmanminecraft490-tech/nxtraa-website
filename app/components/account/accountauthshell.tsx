"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LockKeyhole, Mail, User } from "lucide-react";

import { registerAccount, type RegisterState } from "@/app/account/actions";

type AccountAuthShellProps = {
  redirectTo: string;
  googleEnabled: boolean;
};

const INITIAL_STATE: RegisterState = {};

function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-xl bg-accent font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {children}
    </button>
  );
}

export default function AccountAuthShell({
  redirectTo,
  googleEnabled,
}: AccountAuthShellProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupState, signupAction, signupPending] = useActionState(
    registerAccount,
    INITIAL_STATE,
  );
  const [loginPending, startLoginTransition] = useTransition();
  const [googlePending, startGoogleTransition] = useTransition();

  const googleLabel = useMemo(() => {
    if (!googleEnabled) {
      return "Google setup required";
    }

    return "Continue with Google";
  }, [googleEnabled]);

  useEffect(() => {
    if (!signupState?.success || !signupEmail || !signupPassword) {
      return;
    }

    startLoginTransition(async () => {
      const result = await signIn("credentials", {
        email: signupEmail,
        password: signupPassword,
        redirect: false,
        callbackUrl: redirectTo,
      });

      if (result?.error) {
        setLoginError("Account created. Please sign in with your new password.");
        setMode("login");
        return;
      }

      router.push(result?.url ?? redirectTo);
      router.refresh();
    });
  }, [redirectTo, router, signupEmail, signupPassword, signupState, startLoginTransition]);

  const handleCredentialLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

    startLoginTransition(async () => {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
        callbackUrl: redirectTo,
      });

      if (result?.error) {
        setLoginError("Invalid email or password.");
        return;
      }

      router.push(result?.url ?? redirectTo);
      router.refresh();
    });
  };

  const handleGoogleLogin = () => {
    if (!googleEnabled) {
      return;
    }

    startGoogleTransition(async () => {
      await signIn("google", { callbackUrl: redirectTo });
    });
  };

  return (
    <div className="rounded-[2rem] border border-line bg-white p-8 shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <User size={32} />
      </div>
      <h1 className="mt-6 text-3xl font-black text-ink-950">My account</h1>
      <p className="mt-2 text-ink-500">
        Sign in to view your profile, recent orders, and checkout faster.
      </p>

      <div className="mt-8 grid grid-cols-2 rounded-xl bg-mist p-1 text-sm font-bold">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg px-4 py-3 transition ${
            mode === "login" ? "bg-white text-ink-950 shadow-sm" : "text-ink-500"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-lg px-4 py-3 transition ${
            mode === "signup" ? "bg-white text-ink-950 shadow-sm" : "text-ink-500"
          }`}
        >
          Create account
        </button>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={!googleEnabled || googlePending}
        className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line font-semibold text-ink-800 transition hover:border-line hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Mail size={18} />
        {googlePending ? "Redirecting..." : googleLabel}
      </button>

      {!googleEnabled && (
        <p className="mt-3 text-xs text-ink-500">
          Add `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in your environment to
          enable Google sign-in.
        </p>
      )}

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
        <span className="h-px flex-1 bg-line" />
        Or
        <span className="h-px flex-1 bg-line" />
      </div>

      {mode === "login" ? (
        <form onSubmit={handleCredentialLogin} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink-700">Email</span>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-accent"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink-700">
              Password
            </span>
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-accent"
              required
            />
          </label>
          {loginError && <p className="text-sm font-medium text-red-600">{loginError}</p>}
          <SubmitButton pending={loginPending}>
            {loginPending ? "Signing in..." : "Sign in"}
          </SubmitButton>
        </form>
      ) : (
        <form action={signupAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink-700">
              Full name
            </span>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-accent"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink-700">Email</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(event) => setSignupEmail(event.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-accent"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink-700">
              Password
            </span>
            <input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={signupPassword}
              onChange={(event) => setSignupPassword(event.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-accent"
              required
              minLength={8}
            />
          </label>
          {signupState?.error && (
            <p className="text-sm font-medium text-red-600">{signupState.error}</p>
          )}
          <SubmitButton pending={signupPending}>
            {signupPending ? "Creating account..." : "Create account"}
          </SubmitButton>
        </form>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-2xl bg-accent-soft px-4 py-4 text-sm text-accent-900">
        <LockKeyhole size={18} className="mt-0.5 shrink-0" />
        <p>
          Your account keeps your recent orders in one place and makes checkout
          quicker the next time you shop.
        </p>
      </div>
    </div>
  );
}
