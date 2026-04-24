const pool = require('../helper/db.js');

class UserAccount {

  // Create user
  static async create({ email, password, f_name, l_name, dob, phone }) {
    const query = `
      INSERT INTO user_account
      (email, password, f_name, l_name, dob, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      email,
      password,
      f_name,
      l_name,
      dob,
      phone
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // View all users
  static async getAll() {
    const result = await pool.query(
      `SELECT * FROM user_account ORDER BY f_name;`
    );

    return result.rows;
  }


  // View one user by ID
  static async getById(user_id) {
    const result = await pool.query(
      `SELECT * FROM user_account WHERE user_id = $1;`,
      [user_id]
    );

    return result.rows[0];
  }


  // Search by email
  static async getByEmail(email) {
    const result = await pool.query(
      `SELECT * FROM user_account WHERE email = $1;`,
      [email]
    );

    return result.rows[0];
  }

  // Update account
  static async update(user_id, data) {
    const query = `
      UPDATE user_account
      SET
        f_name = $1,
        l_name = $2,
        dob = $3,
        phone = $4,
        email = $5
      WHERE user_id = $6
      RETURNING *;
    `;

    const values = [
      data.f_name,
      data.l_name,
      data.dob,
      data.phone,
      data.email,
      user_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }


  // Suspend user (maps to your user story)
  static async suspend(user_id) {
    const result = await pool.query(
      `
      UPDATE user_account
      SET suspended = NOT suspended
      WHERE user_id = $1
      RETURNING *;
      `,
      [user_id]
    );

    return result.rows[0];
  }
}

module.exports = UserAccount;
