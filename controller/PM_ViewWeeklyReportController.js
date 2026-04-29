const Donation = require("../entity/donation.js");

class ViewWeeklyReportController {

  static async viewWeeklyReport() {
    return await Donation.getWeeklyReport();
  }
}

module.exports = ViewWeeklyReportController;