import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InterviewLab — AI Interview & Collaborative Coding",
  description:
    "Conduct real-time collaborative coding interviews with a shared editor, live code execution, curated problems, synced timers, and chat.",
  keywords: [
    "technical interview",
    "collaborative coding",
    "code interview platform",
    "live coding",
    "Monaco editor",
  ],
  authors: [{ name: "Harshit" }],
  openGraph: {
    title: "InterviewLab — Technical interviews, done right",
    description:
      "A collaborative coding room with a shared editor, live code execution, synced timers and chat — everything you need to run a great interview.",
    type: "website",
    siteName: "InterviewLab",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewLab — Technical interviews, done right",
    description:
      "Real-time collaborative coding interviews: shared editor, live execution, timers and chat.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
