const UserAccount = require("../entity/user_account.js");

class SuspendUserAccController {

  static async suspendUser(user_id) {
    if (!user_id) {
      throw new Error("User ID is required");
    }

    const user = await UserAccount.suspend(user_id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

module.exports = SuspendUserAccController;