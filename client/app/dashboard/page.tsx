"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { v4 as uuidv4 } from "uuid";
import Logo from "@/components/Logo";
import Aurora from "@/components/Aurora";
import UserMenu from "@/components/UserMenu";
import Counter from "@/components/Counter";
import { useToast } from "@/components/Toast";
import {
  logActivity,
  getActivity,
  timeAgo,
  type Activity,
} from "@/lib/activity";
import {
  Plus,
  LogIn,
  ArrowRight,
  Loader2,
  ClipboardList,
  Star,
  DoorOpen,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface Feedback {
  rating: number;
}

const activityMeta: Record<
  Activity["type"],
  { icon: typeof DoorOpen; color: string }
> = {
  room_created: { icon: DoorOpen, color: "text-indigo-400 bg-indigo-500/10" },
  feedback_submitted: { icon: Star, color: "text-amber-400 bg-amber-500/10" },
  interview_completed: {
    icon: CheckCircle2,
    color: "text-emerald-400 bg-emerald-500/10",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, hydrate } = useAuthStore();
  const toast = useToast();
  const [joinId, setJoinId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [totalInterviews, setTotalInterviews] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [roomsCreated, setRoomsCreated] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Load stats
  useEffect(() => {
    if (!user) return;
    setRoomsCreated(Number(localStorage.getItem("roomsCreated") || "0"));
    setActivities(getActivity());

    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/feedback`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list: Feedback[] = data.feedbacks ?? [];
        setTotalInterviews(list.length);
        setAvgRating(
          list.length
            ? list.reduce((s, f) => s + f.rating, 0) / list.length
            : null
        );
      })
      .catch(() => {
        setTotalInterviews(0);
        setAvgRating(null);
      });
  }, [user]);

  const handleCreateRoom = () => {
    setIsCreating(true);
    const next = roomsCreated + 1;
    localStorage.setItem("roomsCreated", String(next));
    const roomId = uuidv4();
    logActivity("room_created", `Created room #${roomId.slice(0, 6)}`);
    toast.success("Room created! Share the link with your candidate.");
    router.push(`/room/${roomId}`);
  };

  const handleJoinRoom = () => {
    if (!joinId.trim()) {
      toast.error("Please paste a room ID to join.");
      return;
    }
    setIsJoining(true);
    router.push(`/room/${joinId.trim()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center text-neutral-500 text-sm">
        Loading…
      </div>
    );
  }
  if (!user) return null;

  const stats = [
    {
      label: "Total Interviews",
      node:
        totalInterviews === null ? (
          "—"
        ) : (
          <Counter value={totalInterviews} />
        ),
      icon: ClipboardList,
      color: "text-indigo-400 bg-indigo-500/10",
    },
    {
      label: "Average Rating",
      node:
        avgRating === null ? (
          "—"
        ) : (
          <Counter value={avgRating} decimals={1} suffix=" ★" />
        ),
      icon: Star,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      label: "Rooms Created",
      node: <Counter value={roomsCreated} />,
      icon: DoorOpen,
      color: "text-emerald-400 bg-emerald-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-app text-white relative">
      <Aurora />

      {/* Top nav */}
      <nav className="relative border-b border-white/[0.08] px-6 py-3 flex items-center justify-between">
        <Logo />
        <UserMenu />
      </nav>

      <main className="relative max-w-3xl mx-auto px-6 py-12 sm:py-16 animate-fade-up">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Create a new interview room or join an existing one.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-4 sm:p-5"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}
              >
                <s.icon size={17} />
              </div>
              <div className="text-xl sm:text-2xl font-semibold tabular-nums">
                {s.node}
              </div>
              <div className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Create */}
          <div className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-indigo-500/30 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Plus size={20} />
            </div>
            <h2 className="font-semibold mb-1">Create a Room</h2>
            <p className="text-neutral-500 text-sm mb-5 flex-1 leading-relaxed">
              Start a fresh interview session and share the room link with your
              candidate.
            </p>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="group/btn inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-all duration-300 cursor-pointer shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40"
            >
              {isCreating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Room…
                </>
              ) : (
                <>
                  Create Room
                  <ArrowRight
                    size={16}
                    className="group-hover/btn:translate-x-1 transition-transform duration-300"
                  />
                </>
              )}
            </button>
          </div>

          {/* Join */}
          <div className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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
                aria-label="Room ID to join"
                className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] text-white placeholder-neutral-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                onClick={handleJoinRoom}
                disabled={isJoining}
                className="inline-flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 text-sm transition-colors cursor-pointer"
              >
                {isJoining ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Join"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* How it works (onboarding) */}
        <div className="mt-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-neutral-300 mb-4">
            How it works
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                n: 1,
                t: "Create a room",
                d: "Open a room and copy the invite link.",
              },
              {
                n: 2,
                t: "Start the interview",
                d: "Load a problem and code together live.",
              },
              {
                n: 3,
                t: "Give feedback",
                d: "End the session and rate the candidate.",
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold flex items-center justify-center">
                  {step.n}
                </span>
                <div>
                  <div className="text-sm font-medium">{step.t}</div>
                  <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                    {step.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {activities.length > 0 && (
          <div className="mt-8">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-300 mb-3">
              <Clock size={15} className="text-neutral-500" />
              Recent Activity
            </h3>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.05]">
              {activities.map((a, i) => {
                const meta = activityMeta[a.type];
                const Icon = meta.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.color}`}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="text-sm text-neutral-300 flex-1">
                      {a.label}
                    </span>
                    <span className="text-xs text-neutral-600">
                      {timeAgo(a.at)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
