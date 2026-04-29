const UserAccount = require("../entity/user_account.js");

class LoginController {

  static async signup(data) {

    const { email, password, f_name, l_name, dob, phone } = data;

    if (!email || !password || !f_name || !l_name || !dob || !phone) {
      throw new Error("All fields are required.");
    }

    const existingUser = await UserAccount.getByEmail(email);

    if (existingUser) {
      throw new Error("Email already exists.");
    }

    const user = await UserAccount.create({
      email,
      password,
      f_name,
      l_name,
      dob,
      phone
    });

    return user;
  }


  static async login(data) {

    const { email, password } = data;

    const user = await UserAccount.getByEmail(email);

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.password !== password) {
      throw new Error("Wrong password.");
    }

    delete user.password;

    return user;
  }


  static async getProfile(user_id) {

    const user = await UserAccount.getById(user_id);

    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }


  static async updateProfile(user_id, data) {

    const updated = await UserAccount.update(user_id, data);

    if (!updated) {
      throw new Error("User not found.");
    }

    return updated;
  }
}

module.exports = LoginController;