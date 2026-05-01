const FavFRA = require("../entity/fav_fra.js");

class DoneeSearchFavFRActivityController {
  static async search(user_id, activity_name) {
    if (!user_id || !activity_name) {
      throw new Error("User ID and activity name required");
    }

    return await FavFRA.search(user_id, activity_name);
  }
}

module.exports = DoneeSearchFavFRActivityController;