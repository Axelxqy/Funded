const express = require("express");
const router = express.Router();

const DailyReport = require("../controller/PM_ViewDailyReportController");
const WeeklyReport = require("../controller/PM_ViewWeeklyReportController");
const MonthlyReport = require("../controller/PM_ViewMonthlyReportController");

router.get("/daily", async (req, res) => {
  res.json(await DailyReport.generate());
});

router.get("/weekly", async (req, res) => {
  res.json(await WeeklyReport.generate());
});

router.get("/monthly", async (req, res) => {
  res.json(await MonthlyReport.generate());
});

module.exports = router;