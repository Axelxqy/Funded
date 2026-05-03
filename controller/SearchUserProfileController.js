const UserProfile = require("../entity/user_profile.js");

class SearchUserProfileController {
  static async searchProfile(role_name) {
    return await UserProfile.getByRoleName(role_name);
  }
}

module.exports = SearchUserProfileController;