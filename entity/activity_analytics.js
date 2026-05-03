const pool = require("../helper/db.js");

class ActivityAnalytics {
  static async create(activity_id) {
    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const result = await pool.query(
      `
      INSERT INTO public.activity_analytics
      (
        activity_id,
        views_count,
        shortlisted_count
      )
      VALUES ($1, 0, 0)
      ON CONFLICT (activity_id)
      DO NOTHING
      RETURNING *;
      `,
      [activity_id]
    );

    return result.rows[0];
  }

  static async getByActivity(activity_id) {
    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const result = await pool.query(
      `
      SELECT *
      FROM public.activity_analytics
      WHERE activity_id = $1;
      `,
      [activity_id]
    );

    return result.rows[0];
  }

  static async viewNumOfViews(activity_id) {
    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const analytics = await ActivityAnalytics.getByActivity(activity_id);

    if (!analytics) {
      return 0;
    }

    return Number(analytics.views_count) || 0;
  }

  static async viewNumOfShortlisted(activity_id) {
    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const analytics = await ActivityAnalytics.getByActivity(activity_id);

    if (!analytics) {
      return 0;
    }

    return Number(analytics.shortlisted_count) || 0;
  }

  static async incrementViews(activity_id) {
    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const analyticsResult = await client.query(
        `
        INSERT INTO public.activity_analytics
        (
          activity_id,
          views_count,
          shortlisted_count
        )
        VALUES ($1, 1, 0)
        ON CONFLICT (activity_id)
        DO UPDATE SET
          views_count = public.activity_analytics.views_count + 1
        RETURNING *;
        `,
        [activity_id]
      );

      await client.query(
        `
        INSERT INTO public.activity_view_log
        (
          activity_id,
          viewed_at
        )
        VALUES ($1, CURRENT_TIMESTAMP);
        `,
        [activity_id]
      );

      await client.query("COMMIT");

      return analyticsResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async incrementShortlisted(activity_id) {
    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const result = await pool.query(
      `
      INSERT INTO public.activity_analytics
      (
        activity_id,
        views_count,
        shortlisted_count
      )
      VALUES ($1, 0, 1)
      ON CONFLICT (activity_id)
      DO UPDATE SET
        shortlisted_count = public.activity_analytics.shortlisted_count + 1
      RETURNING *;
      `,
      [activity_id]
    );

    return result.rows[0];
  }

  static async decrementShortlisted(activity_id) {
    if (!activity_id) {
      throw new Error("Activity ID required");
    }

    const result = await pool.query(
      `
      INSERT INTO public.activity_analytics
      (
        activity_id,
        views_count,
        shortlisted_count
      )
      VALUES ($1, 0, 0)
      ON CONFLICT (activity_id)
      DO UPDATE SET
        shortlisted_count = GREATEST(public.activity_analytics.shortlisted_count - 1, 0)
      RETURNING *;
      `,
      [activity_id]
    );

    return result.rows[0];
  }
}

module.exports = ActivityAnalytics;