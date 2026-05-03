const UserProfile = require("../entity/user_profile.js");

class ViewUserProfileController {
  static async getAllProfiles() {
    return await UserProfile.getAll();
  }

  static async getProfileById(profile_id) {
    return await UserProfile.getById(profile_id);
  }
}

module.exports = ViewUserProfileController;