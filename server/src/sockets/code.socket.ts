import { Server, Socket } from "socket.io";

interface JoinRoomPayload {
  roomId: string;
}

interface CodeChangePayload {
  roomId: string;
  code: string;
}

export const registerCodeSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", ({ roomId }: JoinRoomPayload) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", { socketId: socket.id });
    });

    socket.on("code-change", ({ roomId, code }: CodeChangePayload) => {
      socket.to(roomId).emit("code-change", { code });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
