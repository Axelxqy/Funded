const UserAccount = require("../entity/user_account.js");

class SearchUserAccController {

  static async searchUserByEmail(email) {
    if (!email) {
      throw new Error("Email is required");
    }

    const user = await UserAccount.getByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

module.exports = SearchUserAccController;