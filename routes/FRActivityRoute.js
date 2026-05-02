const express = require("express");
const router = express.Router();

const CreateFRA = require("../controller/FR_CreateFRActivityController.js");
const ViewFRA = require("../controller/FR_ViewFRActivityController.js");
const UpdateFRA = require("../controller/FR_UpdateFRActivityController.js");
const DeleteFRA = require("../controller/FR_DeleteFRActivityController.js");
const SearchFRA = require("../controller/FR_SearchFRActivityController.js");
const ViewCompletedFRA = require("../controller/FR_ViewCompletedFRActivityController.js");
const SearchCompletedFRA = require("../controller/FR_SearchCompletedFRActivityController.js");

// CREATE
router.post("/", async (req, res) => {
  try {
    const activity = await CreateFRA.createActivity(req.body);

    res.status(201).json({
      message: "Campaign created successfully.",
      activity: activity,
    });
  } catch (error) {
    console.error("Create FRA route error:", error);

    res.status(400).json({
      message: error.message || "Failed to create campaign.",
    });
  }
});

// VIEW ALL
router.get("/", async (req, res) => {
  try {
    const activities = await ViewFRA.getAllActivities();
    res.json(activities);
  } catch (error) {
    console.error("View FRA route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load campaigns.",
    });
  }
});

// VIEW MY ACTIVITIES
// Must be before /:id
router.get("/my/:userId", async (req, res) => {
  try {
    const activities = await ViewFRA.getMyActivities(req.params.userId);
    res.json(activities);
  } catch (error) {
    console.error("View my FRA route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load my campaigns.",
    });
  }
});

// VIEW COMPLETED ACTIVITIES
// Must be before /:id
router.get("/completed", async (req, res) => {
  try {
    const activities = await ViewCompletedFRA.viewCompletedActivities();
    res.json(activities);
  } catch (error) {
    console.error("View completed FRA route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load completed campaigns.",
    });
  }
});

// SEARCH
// Must be before /:id
router.get("/search/:name", async (req, res) => {
  try {
    const activities = await SearchFRA.searchActivity(req.params.name);
    res.json(activities);
  } catch (error) {
    console.error("Search FRA route error:", error);

    res.status(500).json({
      message: error.message || "Failed to search campaigns.",
    });
  }
});

// VIEW ONE
router.get("/:id", async (req, res) => {
  try {
    const activity = await ViewFRA.getActivityById(req.params.id);
    res.json(activity);
  } catch (error) {
    console.error("View one FRA route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load campaign.",
    });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const activity = await UpdateFRA.updateActivity(req.params.id, req.body);

    res.json({
      message: "Campaign updated successfully.",
      activity: activity,
    });
  } catch (error) {
    console.error("Update FRA route error:", error);

    res.status(400).json({
      message: error.message || "Failed to update campaign.",
    });
  }
});

// SEARCH COMPLETED
// Must be before /:id
router.get("/completed/search/:name", async (req, res) => {
  try {
    res.json(
      await SearchCompletedFRA.searchCompletedActivities(req.params.name)
    );
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to search completed campaigns.",
    });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const result = await DeleteFRA.deleteActivity(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Delete FRA route error:", error);

    res.status(400).json({
      message: error.message || "Failed to delete campaign.",
    });
  }
});

module.exports = router;