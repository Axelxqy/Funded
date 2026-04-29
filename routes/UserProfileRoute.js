const express = require("express");
const router = express.Router();

const CreateProfile = require("../controller/CreateUserProfileController.js");
const ViewProfile = require("../controller/ViewUserProfileController.js");
const UpdateProfile = require("../controller/UpdateUserProfileController.js");
const SuspendProfile = require("../controller/SuspendUserProfileController.js");
const SearchProfile = require("../controller/SearchUserProfileController.js");

// CREATE
router.post("/", async (req, res) => {
  res.json(await CreateProfile.createProfile(req.body));
});

// VIEW ALL
router.get("/", async (req, res) => {
  res.json(await ViewProfile.getAllProfiles());
});

// VIEW ONE
router.get("/:id", async (req, res) => {
  res.json(await ViewProfile.getProfileById(req.params.id));
});

// UPDATE
router.put("/:id", async (req, res) => {
  res.json(await UpdateProfile.updateProfile(req.params.id, req.body));
});

// SUSPEND
router.patch("/:id/suspend", async (req, res) => {
  res.json(await SuspendProfile.suspendProfile(req.params.id));
});

// SEARCH
router.get("/search/:name", async (req, res) => {
  res.json(await SearchProfile.searchProfile(req.params.name));
});

module.exports = router;