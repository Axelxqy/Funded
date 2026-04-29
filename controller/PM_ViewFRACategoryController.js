const FRACategory = require("../entity/activity_category.js");

class ViewFRACategoryController {

  static async getAllCategories() {
    return await FRACategory.getAll();
  }

  static async getCategoryById(category_id) {

    if (!category_id) {
      throw new Error("Category ID required");
    }

    const category = await FRACategory.getById(category_id);

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }
}

module.exports = ViewFRACategoryController;