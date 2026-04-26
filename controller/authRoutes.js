const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getProfile,
  updateProfile
} = require("../controller/authController");

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile/:user_id", getProfile);
router.put("/profile/:user_id", updateProfile);

module.exports = router;