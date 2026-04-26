const UserAccount = require("../entity/user_account.js");

class ViewUserAccController {

  // Get all users
  static async getAllUsers() {
    return await UserAccount.getAll();
  }

  // Get one user by ID
  static async getUserById(user_id) {
    if (!user_id) {
      throw new Error("User ID is required");
    }

    const user = await UserAccount.getById(user_id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

module.exports = ViewUserAccController;