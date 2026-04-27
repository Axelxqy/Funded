const FRActivity = require("../entity/fr_activity.js");

class DeleteFRActivityController {

  static async deleteActivity(activity_id) {

    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const result = await FRActivity.delete(activity_id);

    if (!result) {
      throw new Error("Delete failed");
    }

    return { message: "Activity deleted successfully" };
  }
}

module.exports = DeleteFRActivityController;