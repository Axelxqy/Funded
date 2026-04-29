const express = require("express");
const router = express.Router();

const {
  createActivity,
  getActivities,
  getMyActivities,
  getActivityById,
} = require("./frActivityController");

router.post("/", createActivity);
router.get("/", getActivities);
router.get("/my/:userId", getMyActivities);
router.get("/:activityId", getActivityById);

module.exports = router;