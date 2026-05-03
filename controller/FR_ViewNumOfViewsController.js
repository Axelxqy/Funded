const ActivityAnalytics = require("../entity/activity_analytics.js");

class FR_ViewNumOfViewsController {
  static async getViews(activity_id) {
    return await ActivityAnalytics.viewNumOfViews(activity_id);
  }

  static async incrementViews(activity_id) {
    return await ActivityAnalytics.incrementViews(activity_id);
  }
}

module.exports = FR_ViewNumOfViewsController;