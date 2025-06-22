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

app.use(express.json()); // Accept JSON data
app.use(morgan("dev")); // Log requests
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));

// CORS middleware - MUST be before routes
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

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
    origin: "*",
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
    console.log("User setup:", userId);
    socket.join(userId);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => {
    console.log("Typing in room:", room);
    socket.in(room).emit("typing");
  });
  
  socket.on("stop typing", (room) => {
    console.log("Stop typing in room:", room);
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageReceived) => {
    console.log("New message received:", newMessageReceived);
    if (!newMessageReceived.chat || !newMessageReceived.chat.users) {
      return console.error("chat.users not defined in new message event");
    }

    newMessageReceived.chat.users.forEach((user) => {
      // Convert ObjectId to string for comparison
      const userId = user._id.toString();
      const senderId = newMessageReceived.sender._id.toString();
      
      if (userId === senderId) return;
      console.log("Emitting message to user:", userId);
      socket.in(userId).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED:", socket.id);
  });
});
