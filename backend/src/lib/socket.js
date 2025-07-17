import { Server } from "socket.io";
import http from 'http';
import express from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
  },
});

app.set("io", io);
const userSocketMap = {};

const socketLimiter = new RateLimiterMemory({
  points: 30, 
  duration: 60, 
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  socket.onAny(async (event, ...args) => {
    try {
      await socketLimiter.consume(socket.id); 
      if (event === 'joinGroups') {
        const groupIds = args[0];
        groupIds.forEach((id) => {
          const room = `group_${id}`;
          socket.join(room);
          console.log(`Socket ${socket.id} joined room ${room}`);
        });
      }
      
    } catch (rejRes) {
      socket.emit('error', 'Too many requests - please slow down');
      console.log(`Rate limit exceeded for socket ${socket.id}`);
    }
  });

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
