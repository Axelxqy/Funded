const pool = require('../helper/db.js');

class ActivityAnalytics {

  // Create initial analytics row (when activity is created)
  static async create(activity_id) {

    const result = await pool.query(
      `
      INSERT INTO activity_analytics
      (activity_id, views_count, shortlisted_count)
      VALUES ($1, 0, 0)
      RETURNING *;
      `,
      [activity_id]
    );

    return result.rows[0];
  }


  // Get analytics for one activity
  static async getByActivity(activity_id) {

    const result = await pool.query(
      `
      SELECT *
      FROM activity_analytics
      WHERE activity_id = $1;
      `,
      [activity_id]
    );

    return result.rows[0];
  }


  // Increment views
  static async incrementViews(activity_id) {

    const result = await pool.query(
      `
      UPDATE activity_analytics
      SET views_count = views_count + 1
      WHERE activity_id = $1
      RETURNING *;
      `,
      [activity_id]
    );

    return result.rows[0];
  }


  // Increment shortlisted (when added to favourites)
  static async incrementShortlisted(activity_id) {

    const result = await pool.query(
      `
      UPDATE activity_analytics
      SET shortlisted_count = shortlisted_count + 1
      WHERE activity_id = $1
      RETURNING *;
      `,
      [activity_id]
    );

    return result.rows[0];
  }


  // Decrement shortlisted (when removed from favourites)
  static async decrementShortlisted(activity_id) {

    const result = await pool.query(
      `
      UPDATE activity_analytics
      SET shortlisted_count = GREATEST(shortlisted_count - 1, 0)
      WHERE activity_id = $1
      RETURNING *;
      `,
      [activity_id]
    );

    return result.rows[0];
  }

}

module.exports = ActivityAnalytics;