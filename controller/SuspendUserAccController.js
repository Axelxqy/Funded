const UserAccount = require("../entity/user_account.js");

class SuspendUserAccController {
  static async suspendUser(user_id) {
    return await UserAccount.suspend(user_id);
  }
}

module.exports = SuspendUserAccController;