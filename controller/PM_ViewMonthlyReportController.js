const Donation = require("../entity/donation.js");

class ViewMonthlyReportController {

  static async viewMonthlyReport() {
    return await Donation.getMonthlyReport();
  }
}

module.exports = ViewMonthlyReportController;