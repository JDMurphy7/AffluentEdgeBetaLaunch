import { Server } from "socket.io";
import { getUserFromSession } from "../auth.js";
// import { calculatePnL } from "../services/pnl.js";

export function setupSocket(server: any) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.use(async (socket, next) => {
    // Authenticate user from session/cookie
    const user = await getUserFromSession(socket.request);
    if (!user) return next(new Error("unauthorized"));
    (socket as any).user = user;
    next();
  });

  io.on("connection", (socket) => {
    socket.on("subscribe:portfolio", async () => {
      // On trade update, emit only changed P&L fields
      socket.join(`portfolio:${(socket as any).user.id}`);
    });
  });

  // Example: emit update
  function emitPortfolioUpdate(userId: number, data: any) {
    io.to(`portfolio:${userId}`).emit("portfolio:update", data);
  }

  return { io, emitPortfolioUpdate };
}
