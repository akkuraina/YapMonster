const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const colors = require("colors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

dotenv.config();
connectDB();

// Debug environment variables
console.log("=== ENVIRONMENT VARIABLES ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("=============================");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("dev"));
app.use(helmet());

// Scoped rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/user/login", authLimiter);
app.use("/api", apiLimiter);

// Dynamic allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
      return callback(null, origin);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

const livekitRoutes = require("./routes/livekitRoutes");

app.use(cors(corsOptions));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/livekit", livekitRoutes);

// Simple API response for root path
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

// Socket.IO setup
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        return callback(null, origin);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData || !userData._id) {
      console.error("Invalid user data provided for socket setup");
      return;
    }
    const userId = userData._id.toString();
    socket.join(userId);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("delete message", (data) => {
    if (!data || !data.chatId) return;
    socket.to(data.chatId).emit("message deleted", data);
  });

  socket.on("new message", (newMessageReceived) => {
    if (!newMessageReceived.chat || !newMessageReceived.chat.users) {
      return console.error("chat.users not defined in new message event");
    }

    newMessageReceived.chat.users.forEach((user) => {
      const userId = user._id.toString();
      const senderId = newMessageReceived.sender._id.toString();

      if (userId === senderId) return;
      socket.in(userId).emit("message received", newMessageReceived);
    });
  });

  // Video Calling Signaling
  socket.on("call user", (callData) => {
    const { chatId, caller, isGroupChat, chatName, users } = callData;
    if (!chatId || !caller) return;

    if (users && Array.isArray(users)) {
      users.forEach((u) => {
        const targetId = (u._id || u).toString();
        const callerId = (caller._id || caller).toString();
        if (targetId !== callerId) {
          socket.in(targetId).emit("incoming call", {
            chatId,
            caller,
            isGroupChat,
            chatName,
          });
        }
      });
    } else {
      socket.to(chatId).emit("incoming call", {
        chatId,
        caller,
        isGroupChat,
        chatName,
      });
    }
  });

  socket.on("answer call", ({ chatId, callerId, answerer }) => {
    if (callerId) {
      socket.in(callerId.toString()).emit("call answered", { chatId, answerer });
    }
  });

  socket.on("reject call", ({ chatId, callerId, rejecter }) => {
    if (callerId) {
      socket.in(callerId.toString()).emit("call rejected", { chatId, rejecter });
    }
  });

  socket.on("end call", ({ chatId, userId }) => {
    if (chatId) {
      socket.to(chatId).emit("call ended", { chatId, userId });
    }
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED:", socket.id);
  });
});
