const ActivityAnalytics = require("../entity/activity_analytics.js");

class FundraiserViewNumOfViewsController {
  static async viewNumOfViews(activity_id) {
    const data = await ActivityAnalytics.getByActivity(activity_id);
    return data ? data.views_count : null;
  }

  static async addView(activity_id, user_id) {
    return await ActivityAnalytics.addViewOnce(activity_id, user_id);
  }
}

module.exports = FundraiserViewNumOfViewsController;