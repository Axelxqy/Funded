const FRActivity = require("../entity/fr_activity.js");

class CreateFRActivityController {
  static async createActivity(data) {
    return await FRActivity.create(data);
  }
}

module.exports = CreateFRActivityController;