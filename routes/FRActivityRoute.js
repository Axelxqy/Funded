const express = require("express");
const router = express.Router();

/* =========================
   FRA ACTIVITY CONTROLLERS
========================= */
const CreateFRA = require("../controller/FR_CreateFRActivityController.js");
const ViewFRA = require("../controller/FR_ViewFRActivityController.js");
const UpdateFRA = require("../controller/FR_UpdateFRActivityController.js");
const DeleteFRA = require("../controller/FR_DeleteFRActivityController.js");
const SearchFRA = require("../controller/FR_SearchFRActivityController.js");
const ViewCompletedFRA = require("../controller/FR_ViewCompletedFRActivityController.js");
const SearchCompletedFRA = require("../controller/FR_SearchCompletedFRActivityController.js");

/* =========================
   FRA CATEGORY CONTROLLERS
========================= */
const CreateFRACategory = require("../controller/PM_CreateFRACategoryController.js");
const ViewFRACategory = require("../controller/PM_ViewFRACategoryController.js");
const UpdateFRACategory = require("../controller/PM_UpdateFRACategoryController.js");
const DeleteFRACategory = require("../controller/PM_DeleteFRACategoryController.js");
const SearchFRACategory = require("../controller/PM_SearchFRACategoryController.js");

/* ============================================================
   CATEGORY ROUTES
   API:
   GET    /fra/categories
   GET    /fra/categories/search/:name
   GET    /fra/categories/:id
   POST   /fra/categories
   PUT    /fra/categories/:id
   DELETE /fra/categories/:id

   Must be before /:id
============================================================ */

// CREATE CATEGORY
router.post("/categories", async (req, res) => {
  try {
    const category = await CreateFRACategory.createCategory(req.body);

    res.status(201).json({
      message: "Category created successfully.",
      category: category,
    });
  } catch (error) {
    console.error("Create category route error:", error);

    res.status(400).json({
      message: error.message || "Failed to create category.",
    });
  }
});

// VIEW ALL CATEGORIES
router.get("/categories", async (req, res) => {
  try {
    const categories = await ViewFRACategory.getAllCategories();

    res.json(categories);
  } catch (error) {
    console.error("View categories route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load categories.",
    });
  }
});

// SEARCH CATEGORY
// Must be before /categories/:id
router.get("/categories/search/:name", async (req, res) => {
  try {
    const categories = await SearchFRACategory.searchCategory(req.params.name);

    res.json(categories);
  } catch (error) {
    console.error("Search category route error:", error);

    res.status(400).json({
      message: error.message || "Failed to search categories.",
    });
  }
});

// VIEW ONE CATEGORY
router.get("/categories/:id", async (req, res) => {
  try {
    const category = await ViewFRACategory.getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    res.json(category);
  } catch (error) {
    console.error("View one category route error:", error);

    res.status(404).json({
      message: error.message || "Failed to load category.",
    });
  }
});

// UPDATE CATEGORY
router.put("/categories/:id", async (req, res) => {
  try {
    const category = await UpdateFRACategory.updateCategory(
      req.params.id,
      req.body
    );

    res.json({
      message: "Category updated successfully.",
      category: category,
    });
  } catch (error) {
    console.error("Update category route error:", error);

    res.status(400).json({
      message: error.message || "Failed to update category.",
    });
  }
});

// DELETE CATEGORY
router.delete("/categories/:id", async (req, res) => {
  try {
    const deleted = await DeleteFRACategory.deleteCategory(req.params.id);

    res.json({
      message: "Category deleted successfully.",
      category: deleted,
    });
  } catch (error) {
    console.error("Delete category route error:", error);

    res.status(400).json({
      message: error.message || "Failed to delete category.",
    });
  }
});

/* ============================================================
   FRA ACTIVITY ROUTES
============================================================ */

// CREATE FRA
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

// VIEW ALL FRA
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

// SEARCH COMPLETED ACTIVITIES
// Must be before /:id
router.get("/completed/search/:name", async (req, res) => {
  try {
    const activities = await SearchCompletedFRA.searchCompletedActivities(
      req.params.name
    );

    res.json(activities);
  } catch (error) {
    console.error("Search completed FRA route error:", error);

    res.status(500).json({
      message: error.message || "Failed to search completed campaigns.",
    });
  }
});

// SEARCH FRA
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

// VIEW ONE FRA
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

// UPDATE FRA
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

// DELETE FRA
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