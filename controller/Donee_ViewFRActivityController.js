const FRActivity = require("../entity/fr_activity.js");
const ActivityAnalytics = require("../entity/activity_analytics.js");

class DoneeViewFRActivityController {

  static async viewActivity(activity_id) {

    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    // increment views when viewing
    await ActivityAnalytics.incrementViews(activity_id);

    const activity = await FRActivity.getById(activity_id);

    if (!activity) {
      throw new Error("Activity not found");
    }

    return activity;
  }

  static async viewAllActivities() {
    return await FRActivity.getAll();
  }
}

module.exports = DoneeViewFRActivityController;