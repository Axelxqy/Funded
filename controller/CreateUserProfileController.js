const UserProfile = require("../entity/user_profile.js");

class CreateUserProfileController {
  static async createProfile(data) {
    return await UserProfile.create(data);
  }

  static async createRole(data) {
    return await UserProfile.create(data);
  }
}

module.exports = CreateUserProfileController;