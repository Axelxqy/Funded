const FRActivity = require("../entity/fr_activity.js");

class UpdateFRActivityController {
  static async updateActivity(activity_id, data) {
    return await FRActivity.update(activity_id, data);
  }
}

module.exports = UpdateFRActivityController;