const UserAccount = require("../entity/user_account.js");

class CreateUserAccController {
  static async createUser(data) {
    return await UserAccount.create(data);
  }
}

module.exports = CreateUserAccController;