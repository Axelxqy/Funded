const ActivityAnalytics = require("../entity/activity_analytics.js");

class FundraiserViewNumOfShortlistedController {

  static async viewNumOfShortlisted(activity_id) {

    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const analytics = await ActivityAnalytics.getByActivity(activity_id);

    if (!analytics) {
      throw new Error("Analytics not found");
    }

    return analytics.shortlisted_count;
  }
}

module.exports = FundraiserViewNumOfShortlistedController;