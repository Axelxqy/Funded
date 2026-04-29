const FRACategory = require("../entity/activity_category.js");

class UpdateFRACategoryController {

  static async updateCategory(category_id, data) {

    if (!category_id) {
      throw new Error("Category ID required");
    }

    const updated = await FRACategory.update(category_id, data);

    if (!updated) {
      throw new Error("Category not found or update failed");
    }

    return updated;
  }
}

module.exports = UpdateFRACategoryController;