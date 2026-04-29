const FavFRA = require("../entity/fav_fra.js");
const ActivityAnalytics = require("../entity/activity_analytics.js");

class DoneeSaveFRActivityController {

  static async saveFRA(data) {

    const { user_id, activity_id } = data;

    if (!user_id || !activity_id) {
      throw new Error("User ID and Activity ID required");
    }

    // save to favourites
    const fav = await FavFRA.create(data);

    // increment shortlisted count
    await ActivityAnalytics.incrementShortlisted(activity_id);

    return fav;
  }
}

module.exports = DoneeSaveFRActivityController;