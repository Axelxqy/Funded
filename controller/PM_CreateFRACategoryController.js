const FRACategory = require("../entity/activity_category.js");

class CreateFRACategoryController {

  static async createCategory(data) {

    const { name } = data;

    if (!name) {
      throw new Error("Category name required");
    }

    return await FRACategory.create(data);
  }
}

module.exports = CreateFRACategoryController;