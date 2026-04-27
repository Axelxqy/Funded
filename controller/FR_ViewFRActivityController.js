const FRActivity = require("../entity/fr_activity.js");

class ViewFRActivityController {

  static async getAllActivities() {
    return await FRActivity.getAll();
  }

  static async getActivityById(activity_id) {

    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const activity = await FRActivity.getById(activity_id);

    if (!activity) {
      throw new Error("Activity not found");
    }

    return activity;
  }

  static async getCompletedActivities() {
    return await FRActivity.getCompleted();
  }
}

module.exports = ViewFRActivityController;