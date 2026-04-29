const express = require("express");
const router = express.Router();

const LoginController = require("../controller/LoginController.js");

router.post("/login", async (req, res) => {
  try {
    const user = await LoginController.login(req.body);
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const user = await LoginController.signup(req.body);
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;