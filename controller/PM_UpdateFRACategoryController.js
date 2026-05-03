const FRACategory = require("../entity/activity_category.js");

class UpdateFRACategoryController {
  static async updateCategory(category_id, data) {
    return await FRACategory.update(category_id, data);
  }
}

module.exports = UpdateFRACategoryController;