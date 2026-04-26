require("dotenv").config();

const open = require("open");
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const pool = require("./helper/db");
const authRoutes = require("./controller/authRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "boundary")));
app.use("/style", express.static(path.join(__dirname, "style")));
app.use("/auth", authRoutes);

const userManagementRoutes = require("./controller/usermanagementRoutes");
app.use("/admin", userManagementRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "boundary", "homepage.html"));
});

// app.get("/", (req, res) => {
//   res.send("Server is running");
// });

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3000;

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  await open(`http://localhost:${PORT}`);
});