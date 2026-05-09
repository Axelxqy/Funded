require("dotenv").config({ path: "keys.env" });

const open = require("open");
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const pool = require("./helper/db.js");

//Routes
const loginRoute = require("./routes/LoginRoute.js");
const userRoutes = require("./routes/UserAccRoute.js");
const profileRoutes = require("./routes/UserProfileRoute.js");
const fraRoutes = require("./routes/FRActivityRoute.js");
const favRoutes = require("./routes/FavFRActivityRoute.js");
const donationRoutes = require("./routes/DonationRoute.js");
const analyticsRoutes = require("./routes/AnalyticsRoute.js");
const reportRoutes = require("./routes/ReportsRoute.js");

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
app.use("/auth", loginRoute);
app.use("/users", userRoutes);
app.use("/profiles", profileRoutes);
app.use("/fra", fraRoutes);
app.use("/fav", favRoutes);
app.use("/donations", donationRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/reports", reportRoutes);

app.get("/", (req, res) => {
  res.clearCookie("cookie-parser");
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

if (require.main === module) {
  server.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    await open(`http://localhost:${PORT}`);
  });
}

module.exports = app;