const FRActivity = require("../entity/fr_activity.js");

class DeleteFRActivityController {
  static async deleteActivity(activity_id) {
    const result = await FRActivity.delete(activity_id);
  }
}
module.exports = DeleteFRActivityController;