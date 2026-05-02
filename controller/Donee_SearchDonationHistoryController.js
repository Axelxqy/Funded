const Donation = require("../entity/donation.js");

class SearchDonationHistoryController {
  static async searchDonationHistory(user_id, keyword) {
    return await Donation.searchByUser(user_id, keyword);
  }
}

module.exports = SearchDonationHistoryController;