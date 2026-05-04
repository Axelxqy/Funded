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


// increment shortlisted count
router.patch("/:activity_id/shortlisted", async (req, res) => {
  try {
    const analytics = await ViewShortlisted.incrementShortlisted(
      req.params.activity_id
    );

    res.json({
      message: "Shortlisted count updated successfully.",
      analytics: analytics,
    });
  } catch (error) {
    console.error("Increment shortlisted route error:", error);

    res.status(400).json({
      message: error.message || "Failed to update shortlisted count.",
    });
  }
});

// views count
router.get("/:activity_id/views", async (req, res) => {
  try {
    const views = await ViewViews.getViews(req.params.activity_id);
    res.json({
      count: views
    });
  } catch (error) {
    console.error("Get views route error:", error);
    res.status(400).json({
      message: error.message || "Failed to get views count.",
    });
  }
});

// shortlisted count
router.get("/:activity_id/shortlisted", async (req, res) => {
  try {
    const shortlisted = await ViewShortlisted.getShortlisted(
      req.params.activity_id
    );
    res.json({
      count: shortlisted
    });
  } catch (error) {
    console.error("Get shortlisted route error:", error);
    res.status(400).json({
      message: error.message || "Failed to get shortlisted count.",
    });
  }
});

module.exports = router;