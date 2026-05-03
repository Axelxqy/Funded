const express = require("express");
const router = express.Router();

const DailyReport = require("../controller/PM_ViewDailyReportController.js");
const WeeklyReport = require("../controller/PM_ViewWeeklyReportController.js");
const MonthlyReport = require("../controller/PM_ViewMonthlyReportController.js");

// DAILY REPORT
// GET /reports/daily
router.get("/daily", async (req, res) => {
  try {
    const report = await DailyReport.viewDailyReport();
    res.json(report);
  } catch (error) {
    console.error("Daily report route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load daily report.",
    });
  }
});

// WEEKLY REPORT
// GET /reports/weekly
router.get("/weekly", async (req, res) => {
  try {
    const report = await WeeklyReport.viewWeeklyReport();
    res.json(report);
  } catch (error) {
    console.error("Weekly report route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load weekly report.",
    });
  }
});

// MONTHLY REPORT
// GET /reports/monthly
router.get("/monthly", async (req, res) => {
  try {
    const report = await MonthlyReport.viewMonthlyReport();
    res.json(report);
  } catch (error) {
    console.error("Monthly report route error:", error);

    res.status(500).json({
      message: error.message || "Failed to load monthly report.",
    });
  }
});

module.exports = router;