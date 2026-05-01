const Donation = require("../entity/donation.js");

class DoneeViewDonationHistoryController {
  static async viewHistory(user_id) {
    return await Donation.getByUser(user_id);
  }

  static async viewActivityDonations(activity_id) {
    return await Donation.getByActivity(activity_id);
  }

  static async viewUserActivityDonations(user_id, activity_id) {
    return await Donation.getByUserAndActivity(user_id, activity_id);
  }
}

module.exports = DoneeViewDonationHistoryController;