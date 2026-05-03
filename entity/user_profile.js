const pool = require("../helper/db.js");

class UserProfile {
  static async create({ role_name, role_desc }) {
    const result = await pool.query(
      `
      INSERT INTO public.user_profile
      (role_name, role_desc)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [role_name, role_desc]
    );

    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query(
      `
      SELECT *
      FROM public.user_profile
      ORDER BY profile_id;
      `
    );

    return result.rows;
  }

  static async getById(profile_id) {
    const result = await pool.query(
      `
      SELECT *
      FROM public.user_profile
      WHERE profile_id = $1;
      `,
      [profile_id]
    );

    return result.rows[0];
  }

  static async getByRoleName(role_name) {
    const result = await pool.query(
      `
      SELECT *
      FROM public.user_profile
      WHERE LOWER(role_name) = LOWER($1);
      `,
      [role_name]
    );

    return result.rows[0];
  }

  static async update(profile_id, data) {
    const result = await pool.query(
      `
      UPDATE public.user_profile
      SET
        role_name = $1,
        role_desc = $2
      WHERE profile_id = $3
      RETURNING *;
      `,
      [data.role_name, data.role_desc, profile_id]
    );

    return result.rows[0];
  }

  static async suspend(profile_id) {
    const result = await pool.query(
      `
      UPDATE public.user_profile
      SET suspended = NOT suspended
      WHERE profile_id = $1
      RETURNING *;
      `,
      [profile_id]
    );

    return result.rows[0];
  }
}

module.exports = UserProfile;