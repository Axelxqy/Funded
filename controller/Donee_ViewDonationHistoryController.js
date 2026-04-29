const Donation = require("../entity/donation.js");

class ViewDonationHistoryController {

  static async viewDonationHistory(user_id) {

    if (!user_id) {
      throw new Error("User ID required");
    }

    const donations = await Donation.getByUser(user_id);

    return donations;
  }
}

module.exports = ViewDonationHistoryController;