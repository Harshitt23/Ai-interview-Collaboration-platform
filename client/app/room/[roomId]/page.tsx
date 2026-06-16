"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [code, setCode] = useState("");
  const isRemoteChange = useRef(false);

  useEffect(() => {
    const socket = getSocket();

    socket.emit("join-room", { roomId });

    socket.on("code-change", ({ code: incoming }: { code: string }) => {
      isRemoteChange.current = true;
      setCode(incoming);
    });

    return () => {
      socket.off("code-change");
    };
  }, [roomId]);

  const handleChange = (value: string) => {
    setCode(value);

    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    getSocket().emit("code-change", { roomId, code: value });
  };

  return (
    <div>
      <h1>Room: {roomId}</h1>

      <textarea
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        rows={20}
        cols={80}
      />
    </div>
  );
}
