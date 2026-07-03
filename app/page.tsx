"use client";

import { useState } from "react";
import { useAuth } from "./authcontext";

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
    <div className="page-wrap">
      <h1 className="h-section">Login</h1>
      <form onSubmit={handleLogin} className="form">
        {error && <p className="text-error">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}