import Link from "next/link";
import Logo from "@/components/Logo";
import Aurora from "@/components/Aurora";
import {
  Code2,
  Sparkles,
  Timer,
  MessageSquare,
  Play,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Real-time collaborative editor",
    desc: "A shared Monaco editor with live cursors and instant sync — exactly what your candidate types, you see.",
    color: "text-indigo-400 bg-indigo-500/10",
  },
  {
    icon: Sparkles,
    title: "Curated problem bank",
    desc: "Spin up a vetted DSA problem in one click — arrays, graphs, DP and more, across difficulty levels.",
    color: "text-violet-400 bg-violet-500/10",
  },
  {
    icon: Play,
    title: "Run code instantly",
    desc: "Execute solutions in JavaScript, Python, Java, C++ and TypeScript right inside the room.",
    color: "text-emerald-400 bg-emerald-500/10",
  },
  {
    icon: Timer,
    title: "Synced interview timer",
    desc: "A drift-proof countdown every participant sees in sync, so the session stays on track.",
    color: "text-amber-400 bg-amber-500/10",
  },
  {
    icon: MessageSquare,
    title: "Built-in live chat",
    desc: "Side-channel messaging for hints and clarifications without leaving the room.",
    color: "text-sky-400 bg-sky-500/10",
  },
  {
    icon: ClipboardList,
    title: "Structured feedback",
    desc: "Rate the session, log strengths and improvements — all saved to your interview history.",
    color: "text-rose-400 bg-rose-500/10",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-app text-white overflow-x-hidden">
      <Aurora />

      <div className="relative">
        {/* Nav */}
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-neutral-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-3.5 py-1.5 text-xs text-neutral-300 mb-8 animate-fade-up">
            <Sparkles size={13} className="text-indigo-400" />
            Now with one-click coding problems
          </div>

          <h1
            className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05] text-gradient animate-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            Technical interviews,
            <br />
            done right.
          </h1>

          <p
            className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            A collaborative coding room with a shared editor, live code
            execution, synced timers and chat — everything you need to run a
            great interview.
          </p>

          <div
            className="mt-9 flex items-center justify-center gap-3 animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-medium px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
            >
              Start interviewing
              <ArrowRight
                size={17}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
            <Link
              href="/login"
              className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium px-5 py-3 rounded-xl transition-colors"
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* Editor preview mock */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden shadow-2xl shadow-black/50 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {/* window bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#111]">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs text-neutral-500 font-mono">
                room · two-sum
              </span>
              <span className="ml-auto text-xs font-mono text-amber-400">
                28:14
              </span>
            </div>
            {/* split content */}
            <div className="grid grid-cols-5 text-sm">
              <div className="col-span-2 p-5 border-r border-white/[0.06] bg-[#0f0f0f]">
                <div className="text-white font-medium mb-1">Two Sum</div>
                <div className="text-[11px] font-semibold text-emerald-400 mb-3">
                  EASY
                </div>
                <p className="text-neutral-400 text-[13px] leading-relaxed">
                  Given an array of integers, return indices of the two numbers
                  that add up to a target.
                </p>
                <div className="mt-4 rounded-lg bg-white/[0.03] p-3 font-mono text-[12px] text-neutral-400">
                  <div>
                    <span className="text-indigo-400">Input:</span> [2,7,11,15],
                    9
                  </div>
                  <div>
                    <span className="text-emerald-400">Output:</span> [0,1]
                  </div>
                </div>
              </div>
              <div className="col-span-3 p-5 font-mono text-[12.5px] leading-relaxed bg-[#0d0d0d]">
                <div>
                  <span className="text-violet-400">function</span>{" "}
                  <span className="text-sky-400">twoSum</span>
                  <span className="text-neutral-400">(nums, target) {"{"}</span>
                </div>
                <div className="pl-4 text-neutral-400">
                  <span className="text-violet-400">const</span> seen ={" "}
                  <span className="text-neutral-300">new Map();</span>
                </div>
                <div className="pl-4 text-violet-400">
                  for <span className="text-neutral-400">(let i = 0; i {"<"} nums.length; i++) {"{"}</span>
                </div>
                <div className="pl-8 text-neutral-400">
                  <span className="text-violet-400">const</span> need = target -
                  nums[i];
                </div>
                <div className="pl-8 text-violet-400">
                  if <span className="text-neutral-400">(seen.has(need))</span>{" "}
                  return <span className="text-neutral-400">[seen.get(need), i];</span>
                </div>
                <div className="pl-8 text-neutral-300">seen.set(nums[i], i);</div>
                <div className="pl-4 text-neutral-400">{"}"}</div>
                <div className="text-neutral-400">{"}"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-gradient">
              How it works
            </h2>
            <p className="mt-3 text-neutral-500">
              From zero to interviewing in three steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                n: "01",
                t: "Create a room",
                d: "Open an interview room and share the invite link with your candidate.",
              },
              {
                n: "02",
                t: "Code together live",
                d: "Load a problem, write code in the shared editor, and run it instantly.",
              },
              {
                n: "03",
                t: "Review & rate",
                d: "End the session and save structured feedback to your history.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
              >
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-violet-500 mb-3">
                  {s.n}
                </div>
                <h3 className="font-medium mb-1.5">{s.t}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 pb-28">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold tracking-tight text-gradient">
              Everything in one room
            </h2>
            <p className="mt-3 text-neutral-500">
              No tab-switching. No setup. Just open a room and go.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.14] p-6 transition-all hover:-translate-y-0.5"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
                >
                  <f.icon size={19} />
                </div>
                <h3 className="font-medium mb-1.5">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-28">
          <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-b from-indigo-600/10 to-transparent p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight">
                Ready to run your next interview?
              </h2>
              <p className="mt-3 text-neutral-400">
                Create a free account and start in under a minute.
              </p>
              <Link
                href="/signup"
                className="mt-7 inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-200 font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Get started free
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Logo />
            <span className="text-xs text-neutral-600">
              © {new Date().getFullYear()} InterviewLab
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
