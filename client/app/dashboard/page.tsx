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

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ padding: "32px", maxWidth: "480px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <p>Welcome, {user.name}</p>

      <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h2>Create a Room</h2>
          <p style={{ color: "#666", fontSize: "14px" }}>Start a new interview session and share the link.</p>
          <button onClick={handleCreateRoom} style={{ marginTop: "8px" }}>
            Create Room
          </button>
        </div>

        <div>
          <h2>Join a Room</h2>
          <p style={{ color: "#666", fontSize: "14px" }}>Enter a room ID to join an existing session.</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <input
              type="text"
              placeholder="Paste room ID..."
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
              style={{ flex: 1, padding: "6px 10px" }}
            />
            <button onClick={handleJoinRoom}>Join</button>
          </div>
        </div>
      </div>
    </div>
  );
}
