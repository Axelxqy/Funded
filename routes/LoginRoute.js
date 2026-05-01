const express = require("express");
const router = express.Router();

const LoginController = require("../controller/LoginController.js");

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await LoginController.login(req.body);
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// SignUp
router.post("/signup", async (req, res) => {
  try {
    const user = await LoginController.signup(req.body);
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get (View) Profile
router.get("/profile/:user_id", async (req, res) => {
  try {
    const user = await LoginController.getProfile(req.params.user_id);
    res.json({ user });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// UPDATE PROFILE
router.put("/profile/:user_id", async (req, res) => {
  try {
    const user = await LoginController.updateProfile(
      req.params.user_id,
      req.body
    );
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;