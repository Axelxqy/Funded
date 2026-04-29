const FRACategory = require("../entity/activity_category.js");

class DeleteFRACategoryController {

  static async deleteCategory(category_id) {

    if (!category_id) {
      throw new Error("Category ID required");
    }

    const result = await FRACategory.delete(category_id);

    if (!result) {
      throw new Error("Delete failed");
    }

    return { message: "Category deleted successfully" };
  }
}

module.exports = DeleteFRACategoryController;