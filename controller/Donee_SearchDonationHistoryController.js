const Donation = require("../entity/donation.js");

class SearchDonationHistoryController {

  static async searchDonationHistory(user_id, keyword) {

    if (!user_id || !keyword) {
      throw new Error("User ID and search keyword required");
    }

    const results = await Donation.searchByUser(user_id, keyword);

    return results;
  }
}

module.exports = SearchDonationHistoryController;