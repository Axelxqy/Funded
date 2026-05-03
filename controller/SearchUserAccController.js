const UserAccount = require("../entity/user_account.js");

class SearchUserAccController {
  static async searchUser(email) {
    return await UserAccount.getByEmail(email);
  }
}

module.exports = SearchUserAccController;