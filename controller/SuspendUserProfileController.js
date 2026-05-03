const UserProfile = require("../entity/user_profile.js");

class SuspendUserProfileController {
  static async suspendProfile(profile_id) {
    return await UserProfile.suspend(profile_id);
  }
}

module.exports = SuspendUserProfileController;