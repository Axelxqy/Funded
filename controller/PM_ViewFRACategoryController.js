const FRACategory = require("../entity/activity_category.js");

class ViewFRACategoryController {
  static async getAllCategories() {
    return await FRACategory.getAll();
  }

  static async getCategoryById(category_id) {
    return await FRACategory.getById(category_id);
  }
}

module.exports = ViewFRACategoryController;