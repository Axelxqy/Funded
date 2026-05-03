const express = require("express");
const router = express.Router();

const CreateUser = require("../controller/CreateUserAccController.js");
const ViewUser = require("../controller/ViewUserAccController.js");
const UpdateUser = require("../controller/UpdateUserAccController.js");
const SuspendUser = require("../controller/SuspendUserAccController.js");
const SearchUser = require("../controller/SearchUserAccController.js");

// CREATE USER
router.post("/", async (req, res) => {
  try {
    const user = await CreateUser.createUser(req.body);

    res.status(201).json({
      message: "User account created successfully.",
      user: user,
    });
  } catch (err) {
    console.error("Create user route error:", err);

    res.status(400).json({
      message: err.message || "Failed to create user account.",
    });
  }
});

// VIEW ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await ViewUser.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("View users route error:", err);

    res.status(500).json({
      message: err.message || "Failed to load users.",
    });
  }
});

// SEARCH USER
// Must be before "/:id"
router.get("/search/:email", async (req, res) => {
  try {
    const user = await SearchUser.searchUser(req.params.email);
    res.json(user || null);
  } catch (err) {
    console.error("Search user route error:", err);

    res.status(500).json({
      message: err.message || "Failed to search user.",
    });
  }
});

// VIEW ONE USER
router.get("/:id", async (req, res) => {
  try {
    const user = await ViewUser.getUserById(req.params.id);
    res.json(user || null);
  } catch (err) {
    console.error("View one user route error:", err);

    res.status(500).json({
      message: err.message || "Failed to load user.",
    });
  }
});

// UPDATE USER
router.put("/:id", async (req, res) => {
  try {
    const user = await UpdateUser.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    console.error("Update user route error:", err);

    res.status(400).json({
      message: err.message || "Failed to update user.",
    });
  }
});

// SUSPEND USER
router.patch("/:id/suspend", async (req, res) => {
  try {
    const user = await SuspendUser.suspendUser(req.params.id);
    res.json(user);
  } catch (err) {
    console.error("Suspend user route error:", err);

    res.status(400).json({
      message: err.message || "Failed to suspend user.",
    });
  }
});

module.exports = router;