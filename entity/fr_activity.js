const pool = require("../helper/db.js");

class FRActivity {
  // Create activity
  static async create({
    activity_name,
    category_id,
    fundraise_goal,
    current_amount,
    start_date,
    end_date,
    status,
    description,
    created_by,
  }) {
    const result = await pool.query(
      `
      INSERT INTO public.fr_activity
      (
        activity_name,
        category_id,
        fundraise_goal,
        current_amount,
        start_date,
        end_date,
        status,
        description,
        created_by
      )
      VALUES
      ($1, $2, $3, $4, $5::date, $6::date, $7, $8, $9)
      RETURNING
        activity_id,
        activity_name,
        category_id,
        fundraise_goal,
        current_amount,
        TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
        status,
        description,
        created_by;
      `,
      [
        activity_name,
        category_id,
        fundraise_goal,
        current_amount || 0,
        start_date,
        end_date,
        status || "Ongoing",
        description,
        created_by,
      ]
    );

    return result.rows[0];
  }

  // View all activities
  static async getAll() {
    const result = await pool.query(
      `
      SELECT
        fa.activity_id,
        fa.activity_name,
        fa.category_id,
        ac.name AS category_name,
        fa.fundraise_goal,
        fa.current_amount,
        TO_CHAR(fa.start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(fa.end_date, 'YYYY-MM-DD') AS end_date,
        fa.status,
        fa.description,
        fa.created_by,

        ua.f_name AS creator_f_name,
        ua.l_name AS creator_l_name,
        ua.email AS creator_email,

        COALESCE(donor_data.donor_count, 0) AS donor_count

      FROM public.fr_activity fa

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

      ORDER BY fa.activity_id DESC;
      `
    );

    return result.rows;
  }

  // View one activity
  static async getById(activity_id) {
    const result = await pool.query(
      `
      SELECT
        fa.activity_id,
        fa.activity_name,
        fa.category_id,
        ac.name AS category_name,
        fa.fundraise_goal,
        fa.current_amount,
        TO_CHAR(fa.start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(fa.end_date, 'YYYY-MM-DD') AS end_date,
        fa.status,
        fa.description,
        fa.created_by,

        ua.f_name AS creator_f_name,
        ua.l_name AS creator_l_name,
        ua.email AS creator_email,

        COALESCE(donor_data.donor_count, 0) AS donor_count

      FROM public.fr_activity fa

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

      WHERE fa.activity_id = $1;
      `,
      [activity_id]
    );

    return result.rows[0];
  }

  // View activities created by one user
  static async getByCreatedBy(user_id) {
    const result = await pool.query(
      `
      SELECT
        fa.activity_id,
        fa.activity_name,
        fa.category_id,
        ac.name AS category_name,
        fa.fundraise_goal,
        fa.current_amount,
        TO_CHAR(fa.start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(fa.end_date, 'YYYY-MM-DD') AS end_date,
        fa.status,
        fa.description,
        fa.created_by,

        COALESCE(donor_data.donor_count, 0) AS donor_count

      FROM public.fr_activity fa

      LEFT JOIN public.activity_category ac
        ON fa.category_id = ac.category_id

      LEFT JOIN (
        SELECT activity_id, COUNT(*) AS donor_count
        FROM public.donation
        GROUP BY activity_id
      ) donor_data
        ON fa.activity_id = donor_data.activity_id

      WHERE fa.created_by = $1

      ORDER BY fa.activity_id DESC;
      `,
      [user_id]
    );

    return result.rows;
  }

  // Search by activity name
  static async search(activity_name) {
    const result = await pool.query(
      `
      SELECT
        fa.activity_id,
        fa.activity_name,
        fa.category_id,
        ac.name AS category_name,
        fa.fundraise_goal,
        fa.current_amount,
        TO_CHAR(fa.start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(fa.end_date, 'YYYY-MM-DD') AS end_date,
        fa.status,
        fa.description,
        fa.created_by,

        ua.f_name AS creator_f_name,
        ua.l_name AS creator_l_name,
        ua.email AS creator_email,

        COALESCE(donor_data.donor_count, 0) AS donor_count

      FROM public.fr_activity fa

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

      WHERE fa.activity_name ILIKE $1
         OR fa.description ILIKE $1
         OR ac.name ILIKE $1

      ORDER BY fa.activity_id DESC;
      `,
      [`%${activity_name}%`]
    );

    return result.rows;
  }

  // Update activity
  static async update(activity_id, data) {
    const result = await pool.query(
      `
      UPDATE public.fr_activity
      SET
        activity_name = $1,
        category_id = $2,
        fundraise_goal = $3,
        start_date = $4::date,
        end_date = $5::date,
        status = $6,
        description = $7
      WHERE activity_id = $8
      RETURNING
        activity_id,
        activity_name,
        category_id,
        fundraise_goal,
        current_amount,
        TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
        status,
        description,
        created_by;
      `,
      [
        data.activity_name,
        data.category_id,
        data.fundraise_goal,
        data.start_date,
        data.end_date,
        data.status,
        data.description,
        activity_id,
      ]
    );

    return result.rows[0];
  }

  // Delete activity
  static async delete(activity_id) {
    await pool.query(
      `
      DELETE FROM public.fr_activity
      WHERE activity_id = $1;
      `,
      [activity_id]
    );

    return true;
  }

  // View completed activities
  static async getCompleted() {
    const result = await pool.query(
      `
      SELECT
        fa.activity_id,
        fa.activity_name,
        fa.category_id,
        ac.name AS category_name,
        fa.fundraise_goal,
        fa.current_amount,
        TO_CHAR(fa.start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(fa.end_date, 'YYYY-MM-DD') AS end_date,
        fa.status,
        fa.description,
        fa.created_by,

        ua.f_name AS creator_f_name,
        ua.l_name AS creator_l_name,
        ua.email AS creator_email,

        COALESCE(donor_data.donor_count, 0) AS donor_count

      FROM public.fr_activity fa

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

      WHERE
        LOWER(fa.status) IN ('completed', 'complete', 'ended', 'end')
        OR fa.current_amount >= fa.fundraise_goal
        OR fa.end_date <= CURRENT_DATE

      ORDER BY fa.activity_id DESC;
      `
    );

    return result.rows;
  }
}

module.exports = FRActivity;