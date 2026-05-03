const pool = require("../helper/db.js");

class UserAccount {
  // Get default User role
  static async getDefaultUserProfile() {
    const result = await pool.query(
      `
      SELECT *
      FROM public.user_profile
      WHERE LOWER(role_name) = LOWER($1)
      LIMIT 1;
      `,
      ["User"]
    );

    if (result.rows[0]) {
      return result.rows[0];
    }

    const createResult = await pool.query(
      `
      INSERT INTO public.user_profile
      (
        role_name,
        role_desc,
        suspended
      )
      VALUES
      ($1, $2, false)
      RETURNING *;
      `,
      ["User", "Normal platform user"]
    );

    return createResult.rows[0];
  }

  // Create user
  static async create({ email, password, f_name, l_name, dob, phone }) {
    if (!email || !password || !f_name || !l_name || !dob || !phone) {
      throw new Error("All fields are required.");
    }

    const existingUser = await UserAccount.getByEmail(email);

    if (existingUser) {
      throw new Error("Email already exists.");
    }

    const userProfile = await UserAccount.getDefaultUserProfile();

    if (!userProfile || !userProfile.profile_id) {
      throw new Error("Default User role not found.");
    }

    const query = `
      INSERT INTO public.user_account
      (
        email,
        password,
        f_name,
        l_name,
        dob,
        phone,
        profile_id,
        suspended
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, false)
      RETURNING
        user_id,
        email,
        f_name,
        l_name,
        dob,
        phone,
        suspended,
        profile_id;
    `;

    const values = [
      email,
      password,
      f_name,
      l_name,
      dob,
      phone,
      userProfile.profile_id,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  }

  // View all users
  static async getAll() {
    const result = await pool.query(
      `
      SELECT
        ua.user_id,
        ua.email,
        ua.f_name,
        ua.l_name,
        ua.dob,
        ua.phone,
        ua.suspended,
        ua.profile_id,
        up.role_name,
        up.role_desc
      FROM public.user_account ua
      LEFT JOIN public.user_profile up
        ON ua.profile_id = up.profile_id
      ORDER BY ua.f_name;
      `
    );

    return result.rows;
  }

  // View one user by ID
  static async getById(user_id) {
    const result = await pool.query(
      `
      SELECT
        ua.user_id,
        ua.email,
        ua.f_name,
        ua.l_name,
        ua.dob,
        ua.phone,
        ua.suspended,
        ua.profile_id,
        up.role_name,
        up.role_desc
      FROM public.user_account ua
      LEFT JOIN public.user_profile up
        ON ua.profile_id = up.profile_id
      WHERE ua.user_id = $1;
      `,
      [user_id]
    );

    return result.rows[0];
  }

  // Search by email
  static async getByEmail(email) {
    const result = await pool.query(
      `
      SELECT *
      FROM public.user_account
      WHERE email = $1;
      `,
      [email]
    );

    return result.rows[0];
  }

  // Login
  static async login({ email, password }) {
    const result = await pool.query(
      `
      SELECT
        ua.user_id,
        ua.email,
        ua.password,
        ua.f_name,
        ua.l_name,
        ua.dob,
        ua.phone,
        ua.suspended,
        ua.profile_id,
        up.role_name
      FROM public.user_account ua
      LEFT JOIN public.user_profile up
        ON ua.profile_id = up.profile_id
      WHERE ua.email = $1;
      `,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.password !== password) {
      throw new Error("Wrong password.");
    }

    if (user.suspended) {
      throw new Error("Account is suspended.");
    }

    delete user.password;

    return user;
  }

  // Update account
  static async update(user_id, data) {
    const result = await pool.query(
      `
      UPDATE public.user_account
      SET
        f_name = $1,
        l_name = $2,
        dob = $3,
        phone = $4,
        email = $5
      WHERE user_id = $6
      RETURNING
        user_id,
        email,
        f_name,
        l_name,
        dob,
        phone,
        suspended,
        profile_id;
      `,
      [
        data.f_name,
        data.l_name,
        data.dob,
        data.phone,
        data.email,
        user_id,
      ]
    );

    return result.rows[0];
  }

  // Suspend user
  static async suspend(user_id) {
    const result = await pool.query(
      `
      UPDATE public.user_account
      SET suspended = NOT suspended
      WHERE user_id = $1
      RETURNING
        user_id,
        email,
        f_name,
        l_name,
        dob,
        phone,
        suspended,
        profile_id;
      `,
      [user_id]
    );

    return result.rows[0];
  }
}

module.exports = UserAccount;