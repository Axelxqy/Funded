const FRActivity = require("../entity/fr_activity.js");

class SearchCompletedFRActivityController {

  static async searchCompletedActivities(activity_name) {

    if (!activity_name) {
      throw new Error("Activity name required");
    }

    // Step 1: get completed activities
    const completed = await FRActivity.getCompleted();

    // Step 2: filter in controller (clean BCE logic)
    const results = completed.filter(activity =>
      activity.activity_name.toLowerCase().includes(activity_name.toLowerCase())
    );

    return results;
  }
}

module.exports = SearchCompletedFRActivityController;