const express = require("express");
const router = express.Router();

const {
  createActivity,
  getActivities,
  getMyActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} = require("./frActivityController");

router.post("/", createActivity);
router.get("/", getActivities);
router.get("/my/:userId", getMyActivities);
router.get("/:activityId", getActivityById);
router.put("/:activityId", updateActivity);
router.delete("/:activityId", deleteActivity);

module.exports = router;