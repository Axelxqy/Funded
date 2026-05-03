const express = require("express");
const router = express.Router();

const ViewViews = require("../controller/FR_ViewNumOfViewsController.js");
const ViewShortlisted = require("../controller/FR_ViewNumOfShortlistedController.js");

router.get("/:activity_id", async (req, res) => {
  try {
    const activity_id = req.params.activity_id;

    if (!activity_id) {
      return res.status(400).json({ message: "Activity ID required" });
    }
    

    const views = await ViewViews.viewNumOfViews(activity_id);
    const shortlisted = await ViewShortlisted.viewNumOfShortlisted(activity_id);

    if (views === null || shortlisted === null) {
      return res.status(404).json({ message: "Analytics not found" });
    }

    res.json({
      views_count: views,
      shortlisted_count: shortlisted,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Increment Num of Shortlisted
router.post("/:activity_id/shortlisted", async (req, res) => {
  try {
    const { activity_id } = req.params;
    const { user_id } = req.body;

    if (!activity_id) {
      return res.status(400).json({ message: "Activity ID required" });
    }

    if (!user_id) {
      return res.status(400).json({ message: "Invalid user" });
    }

    // Atomic operation (Entity handles everything)
    const result = await ViewShortlisted.addShortlisted(activity_id, user_id);

    if (!result) {
      return res.json({ message: "Already shortlisted" });
    }

    res.json({ shortlisted_count: result.shortlisted_count });

  } catch (error) {
    console.error("Shortlisted ERROR:", error); 
    res.status(500).json({
      message: error.message,
    });
  }
});

// Increment Num of Views
router.post("/:activity_id/view", async (req, res) => {
  try {
    const { activity_id } = req.params;
    const { user_id } = req.body;

    if (!activity_id) {
      return res.status(400).json({ message: "Activity ID required" });
    }

    if (!user_id) {
      return res.status(400).json({ message: "Invalid user" });
    }

    // Atomic operation
    const result = await ViewViews.addView(activity_id, user_id);

    if (!result) {
      return res.json({ message: "Already viewed" });
    }

    res.json({ views_count: result.views_count });

  } catch (error) {
    console.error("VIEW ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;