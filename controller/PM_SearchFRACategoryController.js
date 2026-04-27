const FRACategory = require("../entity/activity_category.js");

class SearchFRACategoryController {

  static async searchCategory(name) {

    if (!name) {
      throw new Error("Category name required");
    }

    return await FRACategory.search(name);
  }
}

module.exports = SearchFRACategoryController;