const FRActivity = require("../entity/fr_activity.js");

class ViewFRActivityController {
  static async getAllActivities() {
    return await FRActivity.getAll();
  }

  static async getActivityById(activity_id) {
    return await FRActivity.getById(activity_id);
  }

  static async getMyActivities(user_id) {
    return await FRActivity.getByCreatedBy(user_id);
  }

  static async getCompletedActivities() {
    return await FRActivity.getCompleted();
  }
}

module.exports = ViewFRActivityController;