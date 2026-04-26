const UserProfile = require("../entity/user_profile.js");

class CreateUserProfileController {
  static async createRole(data) {
    if (!data.role_name) {
      throw new Error("Role name is required");
    }

    return await UserProfile.create(data);
  }
}

module.exports = CreateUserProfileController;