"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      setAuth(response.data.token, response.data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid email or password.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid mask-radial pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-indigo-600/15 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        {/* Card */}
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="text-white text-xl font-semibold mb-1">Welcome back</h1>
          <p className="text-neutral-500 text-sm mb-7">
            Sign in to continue to your dashboard
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-neutral-600 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-neutral-600 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/[0.06] disabled:text-neutral-600 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center mt-5 text-sm text-neutral-600">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
