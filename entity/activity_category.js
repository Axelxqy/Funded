const pool = require('../helper/db.js');

class ActivityCategory {


  // Create category (Platform Manager only)
  static async create({ name, description }) {

    const result = await pool.query(
      `
      INSERT INTO activity_category
      (name, description)
      VALUES ($1,$2)
      RETURNING *;
      `,
      [name, description]
    );

    return result.rows[0];
  }


  // View all categories
  static async getAll() {

    const result = await pool.query(
      `
      SELECT *
      FROM activity_category
      ORDER BY name;
      `
    );

    return result.rows;
  }


  // View one category
  static async getById(category_id) {

    const result = await pool.query(
      `
      SELECT *
      FROM activity_category
      WHERE category_id = $1;
      `,
      [category_id]
    );

    return result.rows[0];
  }


  // Search category by name
  static async search(name) {

    const result = await pool.query(
      `
      SELECT *
      FROM activity_category
      WHERE name ILIKE $1;
      `,
      [`%${name}%`]
    );

    return result.rows;
  }


  // Update category
  static async update(category_id, data) {

    const result = await pool.query(
      `
      UPDATE activity_category
      SET
       name = $1,
       description = $2
      WHERE category_id = $3
      RETURNING *;
      `,
      [
       data.name,
       data.description,
       category_id
      ]
    );

    return result.rows[0];
  }


  // Delete category
  static async delete(category_id) {

    await pool.query(
      `
      DELETE FROM activity_category
      WHERE category_id = $1;
      `,
      [category_id]
    );

    return true;
  }

}

module.exports = ActivityCategory;