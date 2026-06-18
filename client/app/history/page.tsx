"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

interface Feedback {
  id: string;
  roomId: string;
  rating: number;
  strengths: string;
  improvements: string;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "#f59e0b" : "#333", fontSize: "16px" }}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, isLoading, hydrate } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/feedback`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setFeedbacks(data.feedbacks ?? []))
      .finally(() => setIsFetching(false));
  }, [user]);

  if (isLoading || isFetching) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f0f0f", color: "#888" }}>
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#d4d4d4", padding: "40px 32px", maxWidth: "760px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", color: "#fff" }}>Interview History</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#555" }}>
            {feedbacks.length} session{feedbacks.length !== 1 ? "s" : ""} conducted
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ background: "#1e1e1e", color: "#aaa", border: "1px solid #2d2d2d", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
        >
          ← Dashboard
        </button>
      </div>

      {feedbacks.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "80px 0", color: "#444" }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
          <p style={{ margin: 0, fontSize: "15px" }}>No interviews conducted yet.</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px" }}>
            Start a room and click "End Interview" to save feedback.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {feedbacks.map((f) => {
            const isOpen = expanded === f.id;
            const date = new Date(f.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            });
            const time = new Date(f.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit",
            });

            return (
              <div
                key={f.id}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #2d2d2d",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                {/* Row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : f.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#555", fontFamily: "monospace" }}>
                      {f.roomId.slice(0, 8)}…
                    </span>
                    <Stars rating={f.rating} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13px", color: "#888" }}>{date}</div>
                    <div style={{ fontSize: "11px", color: "#444" }}>{time}</div>
                  </div>
                  <span style={{ color: "#555", fontSize: "18px", marginLeft: "16px" }}>
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid #2d2d2d" }}>
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: "bold", marginBottom: "6px", letterSpacing: "0.05em" }}>
                        STRENGTHS
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: "#ccc" }}>
                        {f.strengths}
                      </p>
                    </div>
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "bold", marginBottom: "6px", letterSpacing: "0.05em" }}>
                        AREAS FOR IMPROVEMENT
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: "#ccc" }}>
                        {f.improvements}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
