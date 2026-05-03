const express = require("express");
const router = express.Router();

const ViewViews = require("../controller/FR_ViewNumOfViewsController.js");
const ViewShortlisted = require("../controller/FR_ViewNumOfShortlistedController.js");

// increment views count
router.patch("/:activity_id/views", async (req, res) => {
  try {
    const analytics = await ViewViews.incrementViews(req.params.activity_id);

    res.json({
      message: "View count updated successfully.",
      analytics: analytics,
    });
  } catch (error) {
    console.error("Increment views route error:", error);

    res.status(400).json({
      message: error.message || "Failed to update view count.",
    });
  }
});

// views count
router.get("/:activity_id/views", async (req, res) => {
  try {
    const views_count = await ViewViews.getViews(req.params.activity_id);

    res.json({
      activity_id: Number(req.params.activity_id),
      views_count: views_count,
    });
  } catch (error) {
    console.error("View views route error:", error);

    res.status(400).json({
      message: error.message || "Failed to view views count.",
    });
  }
});

// shortlisted count
router.get("/:activity_id/shortlisted", async (req, res) => {
  try {
    const shortlisted_count = await ViewShortlisted.getShortlisted(
      req.params.activity_id
    );

    res.json({
      activity_id: Number(req.params.activity_id),
      shortlisted_count: shortlisted_count,
    });
  } catch (error) {
    console.error("View shortlisted route error:", error);

    res.status(400).json({
      message: error.message || "Failed to view shortlisted count.",
    });
  }
});

module.exports = router;