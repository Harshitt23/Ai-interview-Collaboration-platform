import Link from "next/link";
import { Code2 } from "lucide-react";

export default function Logo({
  size = "sm",
  href = "/",
}: {
  size?: "sm" | "md";
  href?: string;
}) {
  const box = size === "md" ? "w-9 h-9" : "w-7 h-7";
  const icon = size === "md" ? 20 : 16;
  const text = size === "md" ? "text-lg" : "text-base";
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
    >
      <div
        className={`${box} rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20`}
      >
        <Code2 size={icon} className="text-white" strokeWidth={2.5} />
      </div>
      <span className={`${text} font-semibold tracking-tight text-white`}>
        InterviewLab
      </span>
    </Link>
  );
}
