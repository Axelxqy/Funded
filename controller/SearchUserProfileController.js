const UserProfile = require("../entity/user_profile.js");

class SearchUserProfileController {
  static async searchRole(role_name) {
    if (!role_name) throw new Error("Role name required");

    return await UserProfile.searchByName(role_name);
  }
}

module.exports = SearchUserProfileController;