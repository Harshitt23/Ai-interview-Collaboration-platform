"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/lib/store/authStore";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const pistonLang: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  cpp: "c++",
};

interface ChatMessage {
  socketId: string;
  text: string;
  self?: boolean;
}

interface Problem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
}

const difficultyColor: Record<string, string> = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { user, isLoading, hydrate } = useAuthStore();
  const [code, setCode] = useState("// Start coding here...");
  const [language, setLanguage] = useState("javascript");
  const [participants, setParticipants] = useState<string[]>([]);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [interviewState, setInterviewState] = useState<"idle" | "active">("idle");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [unread, setUnread] = useState(0);
  const isRemoteChange = useRef(false);
  const emitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const startTimer = (startedAt: number, duration: number) => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0 && timerInterval.current) clearInterval(timerInterval.current);
    };
    tick();
    timerInterval.current = setInterval(tick, 1000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatOpen) setUnread(0);
  }, [chatOpen]);

  const handleSendMessage = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { socketId: "you", text, self: true }]);
    getSocket().emit("chat-message", { roomId, text });
    setChatInput("");
  }, [chatInput, roomId]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    socket.emit(
      "join-room",
      { roomId },
      (payload: { code: string | null; problem: Problem | null; timer: { startedAt: number; duration: number } | null }) => {
        if (payload.code) setCode(payload.code);
        if (payload.problem) {
          setProblem(payload.problem);
          setInterviewState("active");
        }
        if (payload.timer) {
          startTimer(payload.timer.startedAt, payload.timer.duration);
        }
      }
    );

    setParticipants((prev) => [...prev, socket.id ?? "you"]);

    socket.on("user-joined", ({ socketId }: { socketId: string }) => {
      setParticipants((prev) =>
        prev.includes(socketId) ? prev : [...prev, socketId]
      );
    });

    socket.on("user-left", ({ socketId }: { socketId: string }) => {
      setParticipants((prev) => prev.filter((id) => id !== socketId));
    });

    socket.on("code-change", ({ code: incoming }: { code: string }) => {
      isRemoteChange.current = true;
      setCode(incoming);
    });

    socket.on("interview-started", ({ problem: p, timer }: { problem: Problem; timer: { startedAt: number; duration: number } }) => {
      setProblem(p);
      setInterviewState("active");
      startTimer(timer.startedAt, timer.duration);
    });

    socket.on("interview-error", ({ message }: { message: string }) => {
      setInterviewState("idle");
      alert(message);
    });

    socket.on("chat-message", ({ socketId, text }: { socketId: string; text: string }) => {
      setMessages((prev) => [...prev, { socketId, text }]);
      setChatOpen((open) => {
        if (!open) setUnread((n) => n + 1);
        return open;
      });
    });

    return () => {
      if (emitTimeout.current) clearTimeout(emitTimeout.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
      socket.emit("leave-room", { roomId });
      setParticipants([]);
      socket.off("code-change");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("interview-started");
      socket.off("interview-error");
      socket.off("chat-message");
    };
  }, [roomId, user]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value ?? "";

    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    setCode(newCode);

    if (emitTimeout.current) clearTimeout(emitTimeout.current);
    emitTimeout.current = setTimeout(() => {
      getSocket().emit("code-change", { roomId, code: newCode });
    }, 300);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running...");
    try {
      const res = await fetch(PISTON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: pistonLang[language] ?? language,
          version: "*",
          files: [{ content: code }],
        }),
      });
      const data = await res.json();
      setOutput(data.run?.output?.trim() || data.run?.stderr?.trim() || "(no output)");
    } catch {
      setOutput("Error: could not reach execution service.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleStartInterview = () => {
    getSocket().emit("start-interview", { roomId });
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          background: "#1e1e1e",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: "bold" }}>Room: {roomId?.slice(0, 8)}…</span>

        {timeLeft !== null && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "18px",
              fontWeight: "bold",
              color: timeLeft <= 300 ? "#ef4444" : "#d4d4d4",
              letterSpacing: "0.05em",
            }}
          >
            {timeLeft === 0 ? "Time's up!" : formatTime(timeLeft)}
          </span>
        )}

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {interviewState !== "active" && (
            <button
              onClick={handleStartInterview}
              style={{
                background: "#7c3aed",
                color: "#fff",
                border: "none",
                padding: "4px 14px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🎯 Start Interview
            </button>
          )}

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ background: "#2d2d2d", color: "#fff", border: "none", padding: "4px 8px" }}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            style={{
              background: isRunning ? "#555" : "#16a34a",
              color: "#fff",
              border: "none",
              padding: "4px 14px",
              borderRadius: "4px",
              cursor: isRunning ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {isRunning ? "Running..." : "▶ Run"}
          </button>

          <button
            onClick={() => setChatOpen((o) => !o)}
            style={{
              position: "relative",
              background: chatOpen ? "#334155" : "#2d2d2d",
              color: "#fff",
              border: "none",
              padding: "4px 14px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            💬 Chat
            {unread > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "10px",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {unread}
              </span>
            )}
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#aaa" }}>
            {participants.length} connected
          </span>
          {participants.map((id) => (
            <span
              key={id}
              title={id}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#4f46e5",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {id.slice(0, 2).toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Main content: problem panel + editor */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left: problem panel */}
        {interviewState === "active" && (
          <div
            style={{
              width: "40%",
              background: "#0f0f0f",
              color: "#d4d4d4",
              overflowY: "auto",
              borderRight: "1px solid #2d2d2d",
              flexShrink: 0,
            }}
          >
            {problem ? (
              <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "18px", color: "#fff" }}>
                    {problem.title}
                  </h2>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: difficultyColor[problem.difficulty] ?? "#888",
                    }}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <p style={{ lineHeight: 1.6, marginBottom: "20px", color: "#ccc" }}>
                  {problem.description}
                </p>

                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#1a1a1a",
                      borderRadius: "6px",
                      padding: "12px",
                      marginBottom: "12px",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ color: "#888", marginBottom: "6px", fontWeight: "bold" }}>
                      Example {i + 1}
                    </div>
                    <div>
                      <span style={{ color: "#7c3aed" }}>Input:</span>{" "}
                      <code style={{ color: "#d4d4d4" }}>{ex.input}</code>
                    </div>
                    <div>
                      <span style={{ color: "#22c55e" }}>Output:</span>{" "}
                      <code style={{ color: "#d4d4d4" }}>{ex.output}</code>
                    </div>
                    {ex.explanation && (
                      <div style={{ color: "#888", marginTop: "4px" }}>
                        <span style={{ color: "#f59e0b" }}>Explanation:</span>{" "}
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}

                <div style={{ marginTop: "20px" }}>
                  <div style={{ color: "#888", fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>
                    CONSTRAINTS
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.8, fontSize: "13px" }}>
                    {problem.constraints.map((c, i) => (
                      <li key={i} style={{ color: "#ccc" }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Right: editor */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>

          {output !== null && (
            <div
              style={{
                height: "200px",
                background: "#0d0d0d",
                color: "#d4d4d4",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                borderTop: "1px solid #333",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 12px",
                  borderBottom: "1px solid #222",
                }}
              >
                <span style={{ fontSize: "11px", color: "#888", letterSpacing: "0.05em" }}>OUTPUT</span>
                <button
                  onClick={() => setOutput(null)}
                  style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "14px" }}
                >
                  ✕
                </button>
              </div>
              <pre
                style={{
                  flex: 1,
                  margin: 0,
                  padding: "10px 12px",
                  overflow: "auto",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {output}
              </pre>
            </div>
          )}
        </div>
        {/* Right: chat panel */}
        {chatOpen && (
          <div
            style={{
              width: "280px",
              background: "#0f0f0f",
              borderLeft: "1px solid #2d2d2d",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid #2d2d2d",
                fontSize: "12px",
                color: "#888",
                fontWeight: "bold",
                letterSpacing: "0.05em",
              }}
            >
              CHAT
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {messages.length === 0 && (
                <span style={{ color: "#444", fontSize: "12px", textAlign: "center", marginTop: "12px" }}>
                  No messages yet
                </span>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.self ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  {!msg.self && (
                    <div style={{ fontSize: "10px", color: "#555", marginBottom: "2px" }}>
                      {msg.socketId.slice(0, 6)}
                    </div>
                  )}
                  <div
                    style={{
                      background: msg.self ? "#4f46e5" : "#1e1e1e",
                      color: "#fff",
                      padding: "6px 10px",
                      borderRadius: msg.self ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      fontSize: "13px",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div
              style={{
                padding: "10px",
                borderTop: "1px solid #2d2d2d",
                display: "flex",
                gap: "6px",
              }}
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Message…"
                style={{
                  flex: 1,
                  background: "#1e1e1e",
                  color: "#fff",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  padding: "6px 8px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                ↑
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
