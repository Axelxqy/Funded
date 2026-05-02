const FRActivity = require("../entity/fr_activity.js");

class DoneeViewFRActivityController {
  static async viewActivity(activity_id) {
    return await FRActivity.getById(activity_id);
  }

  static async viewAllActivities() {
    return await FRActivity.getAll();
  }
}

module.exports = DoneeViewFRActivityController;