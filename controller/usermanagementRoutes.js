const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleSuspendUser,
  changePassword,
  deleteUser,
  getAllRoles
} = require("./userManagementController_backend");

// User routes
router.get("/users", getAllUsers);
router.get("/users/:user_id", getUserById);
router.post("/users", createUser);           // ← NEW: Add new user
router.put("/users/:user_id", updateUser);
router.patch("/users/:user_id/password", changePassword);  // ← NEW: Change password
router.delete("/users/:user_id", deleteUser);

// Roles
router.get("/roles", getAllRoles);

module.exports = router;