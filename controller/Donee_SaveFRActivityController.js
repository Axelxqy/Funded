const FavFRA = require("../entity/fav_fra.js");

class DoneeSaveFRActivityController {
  static async saveFRA(data) {
    return await FavFRA.create(data);
  }

  static async removeFRA(user_id, activity_id) {
    return await FavFRA.deleteByUserAndActivity(user_id, activity_id);
  }
}

module.exports = DoneeSaveFRActivityController;