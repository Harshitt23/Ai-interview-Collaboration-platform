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
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= rating ? "text-amber-400" : "text-neutral-700"}
        >
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-neutral-500 text-sm">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top nav */}
      <nav className="border-b border-white/[0.08] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            AI
          </div>
          <span className="font-semibold tracking-tight">InterviewLab</span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          ← Dashboard
        </button>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Interview History
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {feedbacks.length} session{feedbacks.length !== 1 ? "s" : ""}{" "}
            conducted
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-neutral-400">No interviews conducted yet.</p>
            <p className="text-neutral-600 text-sm mt-1">
              Start a room and click &quot;End Interview&quot; to save feedback.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {feedbacks.map((f) => {
              const isOpen = expanded === f.id;
              const date = new Date(f.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const time = new Date(f.createdAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={f.id}
                  className="bg-[#111111] border border-white/[0.08] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : f.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-600 font-mono">
                        {f.roomId.slice(0, 8)}…
                      </span>
                      <Stars rating={f.rating} />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-neutral-400">{date}</div>
                        <div className="text-xs text-neutral-600">{time}</div>
                      </div>
                      <span className="text-neutral-600">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-white/[0.08]">
                      <div className="mt-4">
                        <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider mb-1.5">
                          Strengths
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed">
                          {f.strengths}
                        </p>
                      </div>
                      <div className="mt-4">
                        <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider mb-1.5">
                          Areas for Improvement
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed">
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
      </main>
    </div>
  );
}
