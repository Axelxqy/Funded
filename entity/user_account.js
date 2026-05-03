const pool = require("../helper/db.js");

class UserAccount {
  // Create user
  static async create({ email, password, f_name, l_name, dob, phone, profile_id }) {
    if (!email || !password || !f_name || !l_name || !dob || !phone || !profile_id) {
      throw new Error("All fields are required.");
    }

    const existingUser = await UserAccount.getByEmail(email);

    if (existingUser) {
      throw new Error("Email already exists.");
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
        profile_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      email,
      password,
      f_name,
      l_name,
      dob,
      phone,
      profile_id,
    ];

    const result = await pool.query(query, values);

    const user = result.rows[0];

    if (user && user.password) {
      delete user.password;
    }

    return user;
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
        up.role_name,
        up.role_desc
      FROM public.user_account ua
      LEFT JOIN public.user_profile up
      ON ua.profile_id = up.profile_id
      WHERE ua.email = $1;
      `,
      [email]
    );

    return result.rows[0];
  }

  // Login
  static async login({ email, password }) {
    const user = await UserAccount.getByEmail(email);

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
    const query = `
      UPDATE public.user_account
      SET
        f_name = $1,
        l_name = $2,
        dob = $3,
        phone = $4,
        email = $5,
        profile_id = $6
      WHERE user_id = $7
      RETURNING *;
    `;

    const values = [
      data.f_name,
      data.l_name,
      data.dob,
      data.phone,
      data.email,
      data.profile_id,
      user_id,
    ];

    const result = await pool.query(query, values);

    const user = result.rows[0];

    if (user && user.password) {
      delete user.password;
    }

    return user;
  }

  // Suspend user
  static async suspend(user_id) {
    const result = await pool.query(
      `
      UPDATE public.user_account
      SET suspended = NOT suspended
      WHERE user_id = $1
      RETURNING *;
      `,
      [user_id]
    );

    const user = result.rows[0];

    if (user && user.password) {
      delete user.password;
    }

    return user;
  }
}

module.exports = UserAccount;