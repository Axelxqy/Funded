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

  //Num Views
  static async addViewOnce(activity_id, user_id) {
    //Try insert into log
    const log = await pool.query(
      `
      INSERT INTO num_view_log (activity_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
      `,
      [activity_id, user_id]
    );

    //If already exists → stop
    if (log.rowCount === 0) {
      return null;
    }

    //Increment analytics
    const result = await pool.query(
      `
      UPDATE activity_analytics
      SET views_count = views_count + 1
      WHERE activity_id = $1
      RETURNING views_count;
      `,
      [activity_id]
    );

    return result.rows[0];
  }

  //Num Shortlisted
  static async addShortlistedOnce(activity_id, user_id) {
    const log = await pool.query(
      `
      INSERT INTO num_shortlist_log (activity_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
      `,
      [activity_id, user_id]
    );

    if (log.rowCount === 0) {
      return null;
    }

    const result = await pool.query(
      `
      UPDATE activity_analytics
      SET shortlisted_count = shortlisted_count + 1
      WHERE activity_id = $1
      RETURNING shortlisted_count;
      `,
      [activity_id]
    );

    return result.rows[0];
  }

  
}

module.exports = ActivityAnalytics;