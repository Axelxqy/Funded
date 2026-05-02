const Donation = require("../entity/donation.js");

class CreateDonationController {
  static async createDonation(data) {
    return await Donation.create(data);
  }
}

module.exports = CreateDonationController;