const Donation = require("../entity/donation.js");

class CreateDonationController {

  static async createDonation(data) {

    const { user_id, activity_id, amount } = data;

    if (!user_id || !activity_id || !amount) {
      throw new Error("Missing required fields");
    }

    if (amount <= 0) {
      throw new Error("Invalid donation amount");
    }

    return await Donation.create({
      user_id,
      activity_id,
      amount
    });
  }
}

module.exports = CreateDonationController;