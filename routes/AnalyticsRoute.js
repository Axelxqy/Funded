const express = require("express");
const router = express.Router();

const ViewViews = require("../controller/FR_ViewNumOfViewsController.js");
const ViewShortlisted = require("../controller/FR_ViewNumOfShortlistedController.js");

// views count
router.get("/:activity_id/views", async (req, res) => {
  res.json(await ViewViews.getViews(req.params.activity_id));
});

// shortlisted count
router.get("/:activity_id/shortlisted", async (req, res) => {
  res.json(await ViewShortlisted.getShortlisted(req.params.activity_id));
});

module.exports = router;