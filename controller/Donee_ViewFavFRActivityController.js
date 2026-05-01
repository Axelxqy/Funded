const FavFRA = require("../entity/fav_fra.js");

class DoneeViewFavFRActivityController {
  static async viewFav(user_id) {
    return await FavFRA.getByUser(user_id);
  }

  static async viewFavFRA(user_id) {
    return await FavFRA.getByUser(user_id);
  }
}

module.exports = DoneeViewFavFRActivityController;