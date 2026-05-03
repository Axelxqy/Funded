const FRACategory = require("../entity/activity_category.js");

class DeleteFRACategoryController {
  static async deleteCategory(category_id) {
    return await FRACategory.delete(category_id);
  }
}

module.exports = DeleteFRACategoryController;