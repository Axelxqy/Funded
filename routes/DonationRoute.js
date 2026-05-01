const express = require("express");
const router = express.Router();

const CreateDonation = require("../controller/Donee_CreateDonationController.js");
const ViewDonation = require("../controller/Donee_ViewDonationHistoryController.js");
const SearchDonation = require("../controller/Donee_SearchDonationHistoryController.js");

// CREATE DONATION
router.post("/", async (req, res) => {
  try {
    const donation = await CreateDonation.createDonation(req.body);

    res.status(201).json({
      message: "Donation successful.",
      donation: donation,
    });
  } catch (error) {
    console.error("Create donation route error:", error);

    res.status(400).json({
      message: error.message || "Donation failed.",
    });
  }
});

// VIEW ONE USER'S DONATIONS FOR ONE ACTIVITY
// Must be before /activity/:activity_id and /:user_id
router.get("/user/:user_id/activity/:activity_id", async (req, res) => {
  try {
    const donations = await ViewDonation.viewUserActivityDonations(
      req.params.user_id,
      req.params.activity_id
    );

    res.json({
      message: "User activity donations retrieved successfully.",
      donations: donations,
    });
  } catch (error) {
    console.error("View user activity donations route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load user activity donations.",
    });
  }
});

// VIEW DONATIONS BY ACTIVITY
router.get("/activity/:activity_id", async (req, res) => {
  try {
    const donations = await ViewDonation.viewActivityDonations(
      req.params.activity_id
    );

    res.json({
      message: "Activity donations retrieved successfully.",
      donations: donations,
    });
  } catch (error) {
    console.error("View activity donations route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load activity donations.",
    });
  }
});

// SEARCH DONATION HISTORY
router.get("/:user_id/search/:keyword", async (req, res) => {
  try {
    const donations = await SearchDonation.searchDonationHistory(
      req.params.user_id,
      req.params.keyword
    );

    res.json({
      message: "Donation search completed.",
      donations: donations,
    });
  } catch (error) {
    console.error("Search donation route error:", error);

    res.status(500).json({
      message: error.message || "Failed to search donation history.",
    });
  }
});

// VIEW DONATION HISTORY
router.get("/:user_id", async (req, res) => {
  try {
    const donations = await ViewDonation.viewHistory(req.params.user_id);

    res.json({
      message: "Donations retrieved successfully.",
      donations: donations,
    });
  } catch (error) {
    console.error("View donation history route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load donation history.",
    });
  }
});

module.exports = router;