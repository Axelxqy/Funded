const FRActivity = require("../entity/fr_activity.js");

class CreateFRActivityController {
  static async createActivity(data) {

    if (!data.activity_name || !data.fundraise_goal) {
      throw new Error("Missing required fields");
    }

    return await FRActivity.create(data);
  }
}

module.exports = CreateFRActivityController;