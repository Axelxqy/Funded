const UserProfile = require("../entity/user_profile.js");

class UpdateUserProfileController {
  static async updateProfile(profile_id, data) {
    return await UserProfile.update(profile_id, data);
  }
}

module.exports = UpdateUserProfileController;