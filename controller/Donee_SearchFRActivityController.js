const FRActivity = require("../entity/fr_activity.js");

class DoneeSearchFRActivityController {

  static async searchActivity(activity_name) {

    if (!activity_name) {
      throw new Error("Activity name required");
    }

    return await FRActivity.search(activity_name);
  }
}

module.exports = DoneeSearchFRActivityController;