const UserAccount = require("../entity/user_account.js");

class LoginController {
  static async signup(data) {
    return await UserAccount.signup(data);
  }

  static async login(data) {
    return await UserAccount.login(data);
  }

  static async getProfile(user_id) {
    return await UserAccount.getProfile(user_id);
  }

  static async updateProfile(user_id, data) {
    return await UserAccount.updateProfile(user_id, data);
  }
}

module.exports = LoginController;