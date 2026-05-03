const express = require("express");
const router = express.Router();

const CreateProfile = require("../controller/CreateUserProfileController.js");
const ViewProfile = require("../controller/ViewUserProfileController.js");
const UpdateProfile = require("../controller/UpdateUserProfileController.js");
const SuspendProfile = require("../controller/SuspendUserProfileController.js");
const SearchProfile = require("../controller/SearchUserProfileController.js");

// CREATE
router.post("/", async (req, res) => {
  try {
    const profile = await CreateProfile.createProfile(req.body);
    res.status(201).json(profile);
  } catch (err) {
    console.error("Create profile error:", err);
    res.status(400).json({ message: err.message });
  }
});

// VIEW ALL
// This will return all roles by default
router.get("/", async (req, res) => {
  try {
    const profiles = await ViewProfile.getAllProfiles();
    res.json(profiles);
  } catch (err) {
    console.error("View all profiles error:", err);
    res.status(500).json({ message: err.message });
  }
});

// SEARCH
// This must be BEFORE "/:id"
router.get("/search/:name", async (req, res) => {
  try {
    const profile = await SearchProfile.searchProfile(req.params.name);
    res.json(profile || null);
  } catch (err) {
    console.error("Search profile error:", err);
    res.status(500).json({ message: err.message });
  }
});

// VIEW ONE
router.get("/:id", async (req, res) => {
  try {
    const profile = await ViewProfile.getProfileById(req.params.id);
    res.json(profile || null);
  } catch (err) {
    console.error("View profile by id error:", err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const profile = await UpdateProfile.updateProfile(req.params.id, req.body);
    res.json(profile);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(400).json({ message: err.message });
  }
});

// SUSPEND
router.patch("/:id/suspend", async (req, res) => {
  try {
    const profile = await SuspendProfile.suspendProfile(req.params.id);
    res.json(profile);
  } catch (err) {
    console.error("Suspend profile error:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;