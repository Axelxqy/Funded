const UserAccount = require("../entity/user_account.js");

class UpdateUserAccController {

  static async updateUser(user_id, data) {
    if (!user_id) {
      throw new Error("User ID is required");
    }

    const updatedUser = await UserAccount.update(user_id, data);

    if (!updatedUser) {
      throw new Error("User not found or update failed");
    }

    return updatedUser;
  }
}

module.exports = UpdateUserAccController;