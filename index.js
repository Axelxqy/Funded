require("dotenv").config();

const express = require('express');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const pool = require('./entity/db');

const app = express();
const server = http.createServer(app);

// ==========================
// 🔥 SOCKET.IO (real-time)
// ==========================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// ==========================
// 🔧 MIDDLEWARE
// ==========================
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ==========================
// 🔌 SOCKET CONNECTION
// ==========================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});