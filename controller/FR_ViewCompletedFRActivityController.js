const FRActivity = require("../entity/fr_activity.js");

class ViewCompletedFRActivityController {

  static async viewCompletedActivities() {

    return await FRActivity.getCompleted();
  }
}

module.exports = ViewCompletedFRActivityController;