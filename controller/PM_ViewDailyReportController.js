const Donation = require("../entity/donation.js");

class ViewDailyReportController {

  static async viewDailyReport() {
    return await Donation.getDailyReport();
  }
}

module.exports = ViewDailyReportController;