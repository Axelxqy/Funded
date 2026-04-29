const express = require("express");
const router = express.Router();

const CreateUser = require("../controller/CreateUserAccController.js");
const ViewUser = require("../controller/ViewUserAccController.js");
const UpdateUser = require("../controller/UpdateUserAccController.js");
const SuspendUser = require("../controller/SuspendUserAccController.js");
const SearchUser = require("../controller/SearchUserAccController.js");

// CREATE
router.post("/", async (req, res) => {
  try {
    const user = await CreateUser.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// VIEW ALL
router.get("/", async (req, res) => {
  res.json(await ViewUser.getAllUsers());
});

// VIEW ONE
router.get("/:id", async (req, res) => {
  res.json(await ViewUser.getUserById(req.params.id));
});

// UPDATE
router.put("/:id", async (req, res) => {
  res.json(await UpdateUser.updateUser(req.params.id, req.body));
});

// SUSPEND
router.patch("/:id/suspend", async (req, res) => {
  res.json(await SuspendUser.suspendUser(req.params.id));
});

// SEARCH
router.get("/search/:email", async (req, res) => {
  res.json(await SearchUser.searchUser(req.params.email));
});

module.exports = router;