const express = require("express");
const router = express.Router();

const CreateFRA = require("../controller/FR_CreateFRActivityController.js");
const ViewFRA = require("../controller/FR_ViewFRActivityController.js");
const UpdateFRA = require("../controller/FR_UpdateFRActivityController.js");
const DeleteFRA = require("../controller/FR_DeleteFRActivityController.js");
const SearchFRA = require("../controller/FR_SearchFRActivityController.js");

// CREATE
router.post("/", async (req, res) => {
  res.json(await CreateFRA.createActivity(req.body));
});

// VIEW ALL
router.get("/", async (req, res) => {
  res.json(await ViewFRA.getAllActivities());
});

// VIEW ONE
router.get("/:id", async (req, res) => {
  res.json(await ViewFRA.getActivityById(req.params.id));
});

// UPDATE
router.put("/:id", async (req, res) => {
  res.json(await UpdateFRA.updateActivity(req.params.id, req.body));
});

// DELETE
router.delete("/:id", async (req, res) => {
  res.json(await DeleteFRA.deleteActivity(req.params.id));
});

// SEARCH
router.get("/search/:name", async (req, res) => {
  res.json(await SearchFRA.searchActivity(req.params.name));
});

module.exports = router;