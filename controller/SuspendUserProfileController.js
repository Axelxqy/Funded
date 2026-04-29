const UserProfile = require("../entity/user_profile.js");

class SuspendUserProfileController {
  static async suspendRole(profile_id) {
    if (!profile_id) throw new Error("Profile ID required");

    const role = await UserProfile.suspend(profile_id);

    if (!role) throw new Error("Role not found");

    return role;
  }
}

module.exports = SuspendUserProfileController;