const FavFRA = require("../entity/fav_fra.js");

class DoneeViewFavFRActivityController {

  static async viewFavFRA(user_id) {

    if (!user_id) {
      throw new Error("User ID required");
    }

    return await FavFRA.getByUser(user_id);
  }
}

module.exports = DoneeViewFavFRActivityController;