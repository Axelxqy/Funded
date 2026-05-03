const UserAccount = require("../entity/user_account.js");

class ViewUserAccController {
  static async getAllUsers() {
    return await UserAccount.getAll();
  }

  static async getUserById(user_id) {
    return await UserAccount.getById(user_id);
  }
}

module.exports = ViewUserAccController;