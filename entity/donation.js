const pool = require("../helper/db.js");

class Donation {
  // Create donation and update campaign amount
  static async create({ user_id, activity_id, amount }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const donationAmount = Number(amount);

      if (!donationAmount || donationAmount <= 0) {
        throw new Error("Invalid donation amount.");
      }

      const activityResult = await client.query(
        `
        SELECT 
          activity_id,
          fundraise_goal,
          current_amount
        FROM public.fr_activity
        WHERE activity_id = $1
        FOR UPDATE;
        `,
        [activity_id]
      );

      if (activityResult.rows.length === 0) {
        throw new Error("Campaign not found.");
      }

      const activity = activityResult.rows[0];

      const goal = Number(activity.fundraise_goal) || 0;
      const currentAmount = Number(activity.current_amount) || 0;
      const newAmount = currentAmount + donationAmount;

      if (newAmount > goal) {
        const remainingAmount = goal - currentAmount;

        throw new Error(
          `Donation exceeds campaign goal. Remaining amount is SGD ${remainingAmount.toFixed(2)}.`
        );
      }

      const donationResult = await client.query(
        `
        INSERT INTO public.donation
        (
          user_id,
          activity_id,
          amount,
          date
        )
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
        `,
        [user_id, activity_id, donationAmount]
      );

      const newStatus = newAmount >= goal ? "Completed" : "Ongoing";

      await client.query(
        `
        UPDATE public.fr_activity
        SET current_amount = $1,
            status = $2
        WHERE activity_id = $3;
        `,
        [newAmount, newStatus, activity_id]
      );

      await client.query("COMMIT");

      return donationResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // View all donations by user
  static async getByUser(user_id) {
    const result = await pool.query(
      `
      SELECT
        d.donation_id,
        d.user_id,
        d.activity_id,
        d.amount,
        d.date,

        'Credit or debit' AS payment_method,
        'Successful' AS donation_status,

        fa.activity_name,
        fa.description,
        fa.fundraise_goal,
        fa.current_amount,
        fa.status,
        fa.start_date,
        fa.end_date,

        ac.name AS category_name

      FROM public.donation d

      JOIN public.fr_activity fa
        ON d.activity_id = fa.activity_id

      LEFT JOIN public.activity_category ac
        ON fa.category_id = ac.category_id

      WHERE d.user_id = $1

      ORDER BY d.date DESC;
      `,
      [user_id]
    );

    return result.rows;
  }

  // View all donations for one activity
  static async getByActivity(activity_id) {
    const result = await pool.query(
      `
      SELECT
        d.donation_id,
        d.user_id,
        d.activity_id,
        d.amount,
        d.date,

        'Credit or debit' AS payment_method,
        'Successful' AS donation_status,

        ua.f_name,
        ua.l_name,
        ua.email

      FROM public.donation d

      LEFT JOIN public.user_account ua
        ON d.user_id = ua.user_id

      WHERE d.activity_id = $1

      ORDER BY d.date DESC;
      `,
      [activity_id]
    );

    return result.rows;
  }

  // View one user's donations for one campaign
  static async getByUserAndActivity(user_id, activity_id) {
    const result = await pool.query(
      `
      SELECT
        d.donation_id,
        d.user_id,
        d.activity_id,
        d.amount,
        d.date,

        'Credit or debit' AS payment_method,
        'Successful' AS donation_status,

        fa.activity_name,
        fa.description,
        fa.fundraise_goal,
        fa.current_amount,
        fa.status,
        fa.start_date,
        fa.end_date,

        ac.name AS category_name

      FROM public.donation d

      JOIN public.fr_activity fa
        ON d.activity_id = fa.activity_id

      LEFT JOIN public.activity_category ac
        ON fa.category_id = ac.category_id

      WHERE d.user_id = $1
        AND d.activity_id = $2

      ORDER BY d.date DESC;
      `,
      [user_id, activity_id]
    );

    return result.rows;
  }

  // Search donation history by keyword only
  static async searchByUser(user_id, keyword) {
    const result = await pool.query(
      `
      SELECT
        d.donation_id,
        d.user_id,
        d.activity_id,
        d.amount,
        d.date,

        'Credit or debit' AS payment_method,
        'Successful' AS donation_status,

        fa.activity_name,
        fa.description,
        fa.fundraise_goal,
        fa.current_amount,
        fa.status,
        fa.start_date,
        fa.end_date,

        ac.name AS category_name

      FROM public.donation d

      JOIN public.fr_activity fa
        ON d.activity_id = fa.activity_id

      LEFT JOIN public.activity_category ac
        ON fa.category_id = ac.category_id

      WHERE d.user_id = $1
        AND (
          fa.activity_name ILIKE $2
          OR fa.description ILIKE $2
          OR ac.name ILIKE $2
        )

      ORDER BY d.date DESC;
      `,
      [user_id, `%${keyword}%`]
    );

    return result.rows;
  }

  static async search(user_id, keyword) {
    return await Donation.searchByUser(user_id, keyword);
  }
}

module.exports = Donation;