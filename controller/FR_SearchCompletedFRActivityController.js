const FRActivity = require("../entity/fr_activity.js");

class SearchCompletedFRActivityController {
  static async searchCompletedActivities(activity_name) {
    return await FRActivity.getCompleted(activity_name);
  }
}

module.exports = SearchCompletedFRActivityController;