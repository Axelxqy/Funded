const pool = require('../helper/db.js');

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
    created_by
  }) {

    const result = await pool.query(
      `
      INSERT INTO fr_activity
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
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
      `,
      [
       activity_name,
       category_id,
       fundraise_goal,
       current_amount,
       start_date,
       end_date,
       status,
       description,
       created_by
      ]
    );

    return result.rows[0];
  }



  // View all activities
  static async getAll() {

    const result = await pool.query(
      `
      SELECT *
      FROM fr_activity
      ORDER BY start_date DESC;
      `
    );

    return result.rows;
  }



  // View one activity
  static async getById(activity_id) {

    const result = await pool.query(
      `
      SELECT *
      FROM fr_activity
      WHERE activity_id=$1;
      `,
      [activity_id]
    );

    return result.rows[0];
  }



  // Search by activity name
  static async search(activity_name) {

    const result = await pool.query(
      `
      SELECT *
      FROM fr_activity
      WHERE activity_name ILIKE $1;
      `,
      [`%${activity_name}%`]
    );

    return result.rows;
  }



  // Update activity
  static async update(activity_id,data){

    const result = await pool.query(
      `
      UPDATE fr_activity
      SET
       activity_name=$1,
       category_id=$2,
       fundraise_goal=$3,
       start_date=$4,
       end_date=$5,
       status=$6,
       description=$7
      WHERE activity_id=$8
      RETURNING *;
      `,
      [
       data.activity_name,
       data.category_id,
       data.fundraise_goal,
       data.start_date,
       data.end_date,
       data.status,
       data.description,
       activity_id
      ]
    );

    return result.rows[0];
  }



  // Delete activity
  static async delete(activity_id){

    await pool.query(
      `
      DELETE FROM fr_activity
      WHERE activity_id=$1;
      `,
      [activity_id]
    );

    return true;
  }



  // View completed activities
  static async getCompleted(){

    const result = await pool.query(
      `
      SELECT *
      FROM fr_activity
      WHERE status='Completed';
      `
    );

    return result.rows;
  }

}

module.exports = FRActivity;