"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { v4 as uuidv4 } from "uuid";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, hydrate, logout } = useAuthStore();
  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCreateRoom = () => {
    const roomId = uuidv4();
    router.push(`/room/${roomId}`);
  };

  const handleJoinRoom = () => {
    if (!joinId.trim()) return;
    router.push(`/room/${joinId.trim()}`);
  };

  if (isLoading) {
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/history")}
            className="text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            History
          </button>
          <button
            onClick={handleLogout}
            className="text-sm bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Create a new interview room or join an existing one.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Create */}
          <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 flex items-center justify-center mb-4 text-lg">
              🚀
            </div>
            <h2 className="font-semibold mb-1">Create a Room</h2>
            <p className="text-neutral-500 text-sm mb-5 flex-1">
              Start a fresh interview session and share the room link with your
              candidate.
            </p>
            <button
              onClick={handleCreateRoom}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors cursor-pointer"
            >
              Create Room
            </button>
          </div>

          {/* Join */}
          <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/15 flex items-center justify-center mb-4 text-lg">
              🔗
            </div>
            <h2 className="font-semibold mb-1">Join a Room</h2>
            <p className="text-neutral-500 text-sm mb-5 flex-1">
              Enter a room ID to join an interview that&apos;s already in
              progress.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste room ID…"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] text-white placeholder-neutral-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                onClick={handleJoinRoom}
                className="bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold rounded-lg px-4 text-sm transition-colors cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
