const UserAccount = require("../entity/user_account.js");

class UpdateUserAccController {
  static async updateUser(user_id, data) {
    return await UserAccount.update(user_id, data);
  }
}

module.exports = UpdateUserAccController;