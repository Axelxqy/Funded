const pool = require('../helper/db.js');

class FavFRA {


  // Add to favourites
  static async create({
    user_id,
    activity_id
  }) {

    const query = `
      INSERT INTO fav_fra
      (user_id, activity_id)
      VALUES ($1,$2)
      RETURNING *;
    `;

    const values = [
      user_id,
      activity_id
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  }



  // View all favourites for one user
  static async getByUser(user_id) {

    const result = await pool.query(
      `
      SELECT
       f.fav_id,
       a.activity_id,
       a.activity_name,
       a.fundraise_goal,
       a.current_amount,
       a.status

      FROM fav_fra f
      JOIN fr_activity a
      ON f.activity_id = a.activity_id

      WHERE f.user_id=$1;
      `,
      [user_id]
    );

    return result.rows;
  }



  // Search within favourites
  static async search(user_id, activity_name){

    const result = await pool.query(
      `
      SELECT
       a.*

      FROM fav_fra f
      JOIN fr_activity a
      ON f.activity_id=a.activity_id

      WHERE
      f.user_id=$1
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



  // Remove from favourites
  static async delete(fav_id){

    await pool.query(
      `
      DELETE FROM fav_fra
      WHERE fav_id=$1;
      `,
      [fav_id]
    );

    return true;
  }

}

module.exports = FavFRA;