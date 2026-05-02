const FavFRA = require("../entity/fav_fra.js");

class DoneeSearchFavFRActivityController {
  static async searchFavFRA(user_id, activity_name) {
    return await FavFRA.search(user_id, activity_name);
  }
}

module.exports = DoneeSearchFavFRActivityController;