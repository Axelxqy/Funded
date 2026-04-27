const FRActivity = require("../entity/fr_activity.js");

class SearchFRActivityController {

  static async searchActivity(activity_name) {

    if (!activity_name) {
      throw new Error("Activity name required");
    }

    const results = await FRActivity.search(activity_name);

    return results;
  }
}

module.exports = SearchFRActivityController;