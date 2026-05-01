const express = require("express");
const router = express.Router();

const SaveFav = require("../controller/Donee_SaveFRActivityController.js");
const ViewFav = require("../controller/Donee_ViewFavFRActivityController.js");
const SearchFav = require("../controller/Donee_SearchFavFRActivityController.js");

// SAVE FAVOURITE
router.post("/", async (req, res) => {
  try {
    console.log("Save favourite body:", req.body);

    const fav = await SaveFav.saveFRA(req.body);

    res.status(201).json({
      message: "Favourite saved successfully.",
      favourite: fav,
    });
  } catch (error) {
    console.error("Save favourite route error:", error);

    res.status(400).json({
      message: error.message || "Failed to save favourite campaign.",
    });
  }
});

// SEARCH FAVOURITES
// Must be before /:user_id
router.get("/:user_id/search/:name", async (req, res) => {
  try {
    const favourites = await SearchFav.searchFav(
      req.params.user_id,
      req.params.name
    );

    res.json({
      message: "Favourite search completed.",
      favourites: favourites,
    });
  } catch (error) {
    console.error("Search favourite route error:", error);

    res.status(500).json({
      message: error.message || "Failed to search favourite campaigns.",
    });
  }
});

// REMOVE FAVOURITE BY USER AND ACTIVITY
// Must be before /:user_id
router.delete("/user/:user_id/activity/:activity_id", async (req, res) => {
  try {
    const result = await SaveFav.removeFRA(
      req.params.user_id,
      req.params.activity_id
    );

    res.json({
      message: "Favourite removed successfully.",
      result: result,
    });
  } catch (error) {
    console.error("Remove favourite route error:", error);

    res.status(400).json({
      message: error.message || "Failed to remove favourite campaign.",
    });
  }
});

// Update 
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

// VIEW FAVOURITES
router.get("/:user_id", async (req, res) => {
  try {
    const favourites = await ViewFav.viewFav(req.params.user_id);

    res.json({
      message: "Favourite campaigns retrieved successfully.",
      favourites: favourites,
    });
  } catch (error) {
    console.error("View favourite route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load favourite campaigns.",
    });
  }
});

module.exports = router;