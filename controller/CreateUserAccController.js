const UserAccount = require("../entity/user_account.js");

class CreateUserAccController {
  static async createUser(data) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error("Email and password required");
    }

    return await UserAccount.create(data);
  }
}

module.exports = CreateUserAccController;