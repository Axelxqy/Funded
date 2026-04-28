const express = require("express");
const router = express.Router();

const {
  createActivity,
  getActivities,
  getMyActivities,
} = require("./frActivityController");

router.post("/", createActivity);
router.get("/", getActivities);
router.get("/my/:userId", getMyActivities);

module.exports = router;