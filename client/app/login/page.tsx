"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

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
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid email or password.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2d2d2d",
          borderRadius: "12px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          color: "#fff",
        }}
      >
        <h1 style={{ margin: "0 0 6px", fontSize: "22px" }}>Welcome back</h1>
        <p style={{ margin: "0 0 28px", fontSize: "13px", color: "#666" }}>
          Sign in to your account
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>
            EMAIL
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              background: "#0f0f0f",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "6px",
              padding: "10px 12px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>
            PASSWORD
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              background: "#0f0f0f",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "6px",
              padding: "10px 12px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              background: "#2d1515",
              border: "1px solid #5c1f1f",
              borderRadius: "6px",
              padding: "10px 12px",
              fontSize: "13px",
              color: "#f87171",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: "100%",
            background: isLoading ? "#2d2d2d" : "#4f46e5",
            color: isLoading ? "#666" : "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "11px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#555" }}>
          Don't have an account?{" "}
          <a
            href="/signup"
            style={{ color: "#818cf8", textDecoration: "none" }}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
