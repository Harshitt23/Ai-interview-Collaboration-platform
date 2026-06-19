"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useToast } from "@/components/Toast";
import { User, History, LogOut, ChevronDown } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.info("Signed out.");
    router.push("/login");
  };

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-white/[0.06] transition-colors cursor-pointer"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-600/20">
          {initials(user.name)}
        </span>
        <ChevronDown
          size={15}
          className={`text-neutral-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-[#15131f]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-up"
        >
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="text-sm font-medium text-white truncate">
              {user.name}
            </div>
            <div className="text-xs text-neutral-500 truncate">{user.email}</div>
          </div>

          <div className="py-1">
            <button
              role="menuitem"
              onClick={() => go("/profile")}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
            >
              <User size={16} className="text-neutral-500" />
              Profile
            </button>
            <button
              role="menuitem"
              onClick={() => go("/history")}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
            >
              <History size={16} className="text-neutral-500" />
              Interview History
            </button>
          </div>

          <div className="py-1 border-t border-white/[0.06]">
            <button
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
