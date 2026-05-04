const ActivityAnalytics = require("../entity/activity_analytics.js");

class FR_ViewNumOfShortlistedController {
  static async getShortlisted(activity_id) {
    return await ActivityAnalytics.viewNumOfShortlisted(activity_id);
  }

  static async incrementShortlisted(activity_id) {
    return await ActivityAnalytics.incrementShortlisted(activity_id);
  }
}

module.exports = FR_ViewNumOfShortlistedController;