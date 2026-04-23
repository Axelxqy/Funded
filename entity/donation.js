const pool = require('../helper/db.js');

class Donation {


  // Create donation
  static async create({
    user_id,
    activity_id,
    amount
  }) {

    try {

      await pool.query("BEGIN");


      //Insert donation
      const donationResult = await pool.query(
        `
        INSERT INTO donation
        (
         user_id,
         activity_id,
         amount
        )
        VALUES
        ($1,$2,$3)
        RETURNING *;
        `,
        [
         user_id,
         activity_id,
         amount
        ]
      );


      //Update fundraising current_amount
      await pool.query(
        `
        UPDATE fr_activity
        SET current_amount =
            current_amount + $1
        WHERE activity_id=$2;
        `,
        [
         amount,
         activity_id
        ]
      );


      //Mark completed if goal reached
      await pool.query(
        `
        UPDATE fr_activity
        SET status='Completed'
        WHERE activity_id=$1
        AND current_amount >= fundraise_goal;
        `,
        [activity_id]
      );


      await pool.query("COMMIT");


      return donationResult.rows[0];

    } catch(err){

      await pool.query("ROLLBACK");
      throw err;

    }

  }


  // View all donations by user
  static async getByUser(user_id){

    const result = await pool.query(
      `
      SELECT
      d.*,
      a.activity_name

      FROM donation d
      JOIN fr_activity a
      ON d.activity_id=a.activity_id

      WHERE d.user_id=$1

      ORDER BY d.date DESC;
      `,
      [user_id]
    );

    return result.rows;
  }



  // Search donation history
  static async search(user_id,activity_name){

    const result = await pool.query(
      `
      SELECT
      d.*,
      a.activity_name

      FROM donation d
      JOIN fr_activity a
      ON d.activity_id=a.activity_id

      WHERE
      d.user_id=$1
      AND
      a.activity_name ILIKE $2;
      `,
      [
       user_id,
       `%${activity_name}%`
      ]
    );

    return result.rows;
  }

}

module.exports = Donation;