const UserProfile = require("../entity/user_profile.js");

class ViewUserProfileController {

  static async getAllRoles() {
    return await UserProfile.getAll();
  }

  static async getRoleById(profile_id) {
    if (!profile_id) throw new Error("Profile ID required");

    const role = await UserProfile.getById(profile_id);

    if (!role) throw new Error("Role not found");

    return role;
  }
}

module.exports = ViewUserProfileController;