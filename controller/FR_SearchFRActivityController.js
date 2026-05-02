const FRActivity = require("../entity/fr_activity.js");

class SearchFRActivityController {
  static async searchActivity(activity_name) {
    return await FRActivity.search(activity_name);
  }
}

module.exports = SearchFRActivityController;