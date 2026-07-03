"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../authcontext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      login(data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="page-wrap flex flex-col items-center justify-center py-20">
      <h1 className="h-section text-center">Login</h1>
      <form onSubmit={handleLogin} className="form w-full max-w-sm mt-8">
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input mb-4" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input mb-6" required />
        <button type="submit" className="btn btn-primary w-full">
          Login
        </button>
        <p className="mt-6 text-center text-sm text-ink-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}