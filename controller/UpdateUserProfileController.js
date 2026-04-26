const UserProfile = require("../entity/user_profile.js");

class UpdateUserProfileController {
  static async updateRole(profile_id, data) {
    if (!profile_id) throw new Error("Profile ID required");

    const updated = await UserProfile.update(profile_id, data);

    if (!updated) throw new Error("Role not found");

    return updated;
  }
}

module.exports = UpdateUserProfileController;