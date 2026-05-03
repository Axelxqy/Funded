const FRACategory = require("../entity/activity_category.js");

class SearchFRACategoryController {
  static async searchCategory(name) {
    return await FRACategory.search(name);
  }
}

module.exports = SearchFRACategoryController;