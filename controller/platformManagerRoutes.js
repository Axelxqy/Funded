/* ============================================================
   PLATFORM MANAGER ROUTES
   Place in: controller/platformManagerRoutes.js
   Register in index.js: app.use('/pm', require('./controller/platformManagerRoutes'))
============================================================ */

const express = require("express");
const router  = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
} = require("./platformManagerController_back");

// Category routes
router.get("/categories",              getAllCategories);
router.get("/categories/:category_id", getCategoryById);
router.post("/categories",             createCategory);
router.put("/categories/:category_id", updateCategory);
router.delete("/categories/:category_id", deleteCategory);

// Report routes
router.get("/reports/daily",   getDailyReport);
router.get("/reports/weekly",  getWeeklyReport);
router.get("/reports/monthly", getMonthlyReport);

module.exports = router;