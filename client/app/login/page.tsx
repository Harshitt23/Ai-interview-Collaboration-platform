"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import Logo from "@/components/Logo";
import Aurora from "@/components/Aurora";
import { useToast } from "@/components/Toast";

const LOADING_STEPS = [
  "Waking up the server…",
  "Verifying your credentials…",
  "Loading your workspace…",
  "Fetching your interview history…",
  "Personalizing your dashboard…",
  "Almost there…",
];

function LoadingOverlay() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 3500);
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => {
      clearInterval(stepTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090f]/90 backdrop-blur-md">
      <Aurora />
      <div className="relative flex flex-col items-center gap-8">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-violet-500 border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border border-white/5" />
          <div
            className="absolute inset-2 rounded-full border border-t-violet-400/60 border-transparent animate-spin"
            style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
          />
        </div>

        {/* Step text */}
        <div className="text-center">
          <p className="text-white/90 text-sm font-medium tracking-wide min-w-[220px]">
            {LOADING_STEPS[stepIndex]}
            <span className="inline-block w-6 text-left text-indigo-400">
              {dots}
            </span>
          </p>
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {LOADING_STEPS.map((_, i) => (
              <span
                key={i}
                className={`block h-1 rounded-full transition-all duration-500 ${
                  i <= stepIndex
                    ? "w-4 bg-indigo-500"
                    : "w-1.5 bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-neutral-600 text-xs max-w-[200px] text-center leading-relaxed">
          Free-tier server may need a moment to spin up
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const toast = useToast();
  const didPrwarm = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Pre-warm the Render server the moment the login page loads
  useEffect(() => {
    if (didPrwarm.current) return;
    didPrwarm.current = true;
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/health`).catch(() => {});
  }, []);

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
      toast.success(`Welcome back, ${response.data.user.name.split(" ")[0]}!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid email or password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4">
      <Aurora />

      {isLoading && <LoadingOverlay />}

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
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
                className="w-full bg-white/4 border border-white/8 text-white placeholder-neutral-600 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
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
                className="w-full bg-white/4 border border-white/8 text-white placeholder-neutral-600 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
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
            className="mt-6 w-full bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 disabled:from-white/6 disabled:to-white/6 disabled:text-neutral-600 text-white font-semibold rounded-lg py-2.5 text-sm transition-all duration-300 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40"
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
