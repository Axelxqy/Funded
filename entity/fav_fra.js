const pool = require("../helper/db.js");

class FavFRA {
  static async create({ user_id, activity_id }) {
    const existing = await pool.query(
      `
      SELECT *
      FROM public.fav_fra
      WHERE user_id = $1
        AND activity_id = $2
      LIMIT 1;
      `,
      [user_id, activity_id]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const result = await pool.query(
      `
      INSERT INTO public.fav_fra
      (
        user_id,
        activity_id
      )
      VALUES ($1, $2)
      RETURNING *;
      `,
      [user_id, activity_id]
    );

    return result.rows[0];
  }

  static async getByUser(user_id) {
    const result = await pool.query(
      `
      SELECT
        f.fav_id,
        f.user_id,

        fa.activity_id,
        fa.activity_name,
        fa.category_id,
        ac.name AS category_name,
        fa.fundraise_goal,
        fa.current_amount,
        fa.start_date,
        fa.end_date,
        fa.status,
        fa.description,
        fa.created_by,

        ua.f_name AS creator_f_name,
        ua.l_name AS creator_l_name,
        ua.email AS creator_email,

        COALESCE(donor_data.donor_count, 0) AS donor_count

      FROM public.fav_fra f

      JOIN public.fr_activity fa
        ON f.activity_id = fa.activity_id

      LEFT JOIN public.activity_category ac
        ON fa.category_id = ac.category_id

      LEFT JOIN public.user_account ua
        ON fa.created_by = ua.user_id

      LEFT JOIN (
        SELECT activity_id, COUNT(*) AS donor_count
        FROM public.donation
        GROUP BY activity_id
      ) donor_data
        ON fa.activity_id = donor_data.activity_id

      WHERE f.user_id = $1

      ORDER BY f.fav_id DESC;
      `,
      [user_id]
    );

    return result.rows;
  }

  static async search(user_id, activity_name) {
    const result = await pool.query(
      `
      SELECT
        f.fav_id,
        f.user_id,

        fa.activity_id,
        fa.activity_name,
        fa.category_id,
        ac.name AS category_name,
        fa.fundraise_goal,
        fa.current_amount,
        fa.start_date,
        fa.end_date,
        fa.status,
        fa.description,
        fa.created_by,

        ua.f_name AS creator_f_name,
        ua.l_name AS creator_l_name,
        ua.email AS creator_email,

        COALESCE(donor_data.donor_count, 0) AS donor_count

      FROM public.fav_fra f

      JOIN public.fr_activity fa
        ON f.activity_id = fa.activity_id

      LEFT JOIN public.activity_category ac
        ON fa.category_id = ac.category_id

      LEFT JOIN public.user_account ua
        ON fa.created_by = ua.user_id

      LEFT JOIN (
        SELECT activity_id, COUNT(*) AS donor_count
        FROM public.donation
        GROUP BY activity_id
      ) donor_data
        ON fa.activity_id = donor_data.activity_id

      WHERE f.user_id = $1
        AND (
          fa.activity_name ILIKE $2
          OR fa.description ILIKE $2
          OR ac.name ILIKE $2
        )

      ORDER BY f.fav_id DESC;
      `,
      [user_id, `%${activity_name}%`]
    );

    return result.rows;
  }

  static async delete(fav_id) {
    await pool.query(
      `
      DELETE FROM public.fav_fra
      WHERE fav_id = $1;
      `,
      [fav_id]
    );

    return true;
  }

  static async deleteByUserAndActivity(user_id, activity_id) {
    await pool.query(
      `
      DELETE FROM public.fav_fra
      WHERE user_id = $1
        AND activity_id = $2;
      `,
      [user_id, activity_id]
    );

    return true;
  }
}

module.exports = FavFRA;