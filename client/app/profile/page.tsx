"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import Logo from "@/components/Logo";
import Aurora from "@/components/Aurora";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeft, Mail, User as UserIcon } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center text-neutral-500 text-sm">
        Loading…
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-app text-white relative">
      <Aurora />

      <nav className="relative border-b border-white/[0.08] px-6 py-3.5 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
        </div>
      </nav>

      <main className="relative max-w-xl mx-auto px-6 py-12 animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight mb-8">Profile</h1>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-600/20">
              {initials(user.name)}
            </span>
            <div>
              <div className="text-lg font-semibold">{user.name}</div>
              <div className="text-sm text-neutral-500">{user.email}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
              <UserIcon size={18} className="text-neutral-500" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-600">
                  Name
                </div>
                <div className="text-sm">{user.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
              <Mail size={18} className="text-neutral-500" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-600">
                  Email
                </div>
                <div className="text-sm">{user.email}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
