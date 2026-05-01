const FavFRA = require("../entity/fav_fra.js");
const ActivityAnalytics = require("../entity/activity_analytics.js");

class DoneeSaveFRActivityController {
  static async saveFRA(data) {
    const { user_id, activity_id } = data;

    if (!user_id || !activity_id) {
      throw new Error("User ID and Activity ID required");
    }

    const fav = await FavFRA.create({
      user_id: user_id,
      activity_id: activity_id,
    });

    try {
      await ActivityAnalytics.incrementShortlisted(activity_id);
    } catch (error) {
      console.warn("Increment shortlisted analytics failed:", error.message);
    }

    return fav;
  }

  static async removeFRA(user_id, activity_id) {
    if (!user_id || !activity_id) {
      throw new Error("User ID and Activity ID required");
    }

    return await FavFRA.deleteByUserAndActivity(user_id, activity_id);
  }
}

module.exports = DoneeSaveFRActivityController;