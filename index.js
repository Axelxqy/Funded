require("dotenv").config();

const express = require('express');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const pool = require('./helper/db');
const authRoutes = require("./controller/authRoutes");

const app = express();
const server = http.createServer(app);

// ==========================
// 🔥 SOCKET.IO (real-time)
// ==========================
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

// ==========================
// 🔧 MIDDLEWARE
// ==========================
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);

// ==========================
// 🔌 SOCKET CONNECTION
// ==========================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  });