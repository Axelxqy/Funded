const FRActivity = require("../entity/fr_activity.js");

class UpdateFRActivityController {

  static async updateActivity(activity_id, data) {

    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const updated = await FRActivity.update(activity_id, data);

    if (!updated) {
      throw new Error("Activity not found or update failed");
    }

    return updated;
  }
}

module.exports = UpdateFRActivityController;