"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { v4 as uuidv4 } from "uuid";
import Logo from "@/components/Logo";
import { Plus, LogIn, History, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      <div className="absolute inset-0 bg-grid mask-radial pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top nav */}
      <nav className="relative border-b border-white/[0.08] px-6 py-3.5 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/history")}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white hover:bg-white/[0.04] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <History size={15} />
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

      <main className="relative max-w-3xl mx-auto px-6 py-16">
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
          <div className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-6 flex flex-col transition-all">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Plus size={20} />
            </div>
            <h2 className="font-semibold mb-1">Create a Room</h2>
            <p className="text-neutral-500 text-sm mb-5 flex-1 leading-relaxed">
              Start a fresh interview session and share the room link with your
              candidate.
            </p>
            <button
              onClick={handleCreateRoom}
              className="group/btn inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              Create Room
              <ArrowRight
                size={16}
                className="group-hover/btn:translate-x-0.5 transition-transform"
              />
            </button>
          </div>

          {/* Join */}
          <div className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-6 flex flex-col transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <LogIn size={19} />
            </div>
            <h2 className="font-semibold mb-1">Join a Room</h2>
            <p className="text-neutral-500 text-sm mb-5 flex-1 leading-relaxed">
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
                className="bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium rounded-lg px-4 text-sm transition-colors cursor-pointer"
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
