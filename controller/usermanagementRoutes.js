const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  toggleSuspendUser,
  deleteUser,
  getAllRoles
} = require("./userManagementController_backend");

// User routes
router.get("/users", getAllUsers);
router.get("/users/:user_id", getUserById);
router.put("/users/:user_id", updateUser);
router.patch("/users/:user_id/suspend", toggleSuspendUser);
router.delete("/users/:user_id", deleteUser);

// Roles
router.get("/roles", getAllRoles);

module.exports = router;