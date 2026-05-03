const ActivityAnalytics = require("../entity/activity_analytics.js");

class FundraiserViewNumOfShortlistedController {
  static async viewNumOfShortlisted(activity_id) {
    const data = await ActivityAnalytics.getByActivity(activity_id);
    return data ? data.shortlisted_count : null;
  }

  static async addShortlisted(activity_id, user_id) {
    return await ActivityAnalytics.addShortlistedOnce(activity_id, user_id);
  }
}

module.exports = FundraiserViewNumOfShortlistedController;