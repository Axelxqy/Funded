const pool = require("../helper/db.js");

class ActivityCategory {
  // Create category
  static async create({ name, description }) {
    if (!name) {
      throw new Error("Category name required");
    }

    const existing = await ActivityCategory.getByName(name);

    if (existing) {
      throw new Error("Category name already exists.");
    }

    const result = await pool.query(
      `
      INSERT INTO public.activity_category
      (
        name,
        description
      )
      VALUES ($1, $2)
      RETURNING *;
      `,
      [name, description || ""]
    );

    return result.rows[0];
  }

  // View all categories
  static async getAll() {
    const result = await pool.query(
      `
      SELECT
        category_id,
        name,
        description
      FROM public.activity_category
      ORDER BY name;
      `
    );

    return result.rows;
  }

  // View one category
  static async getById(category_id) {
    const result = await pool.query(
      `
      SELECT
        category_id,
        name,
        description
      FROM public.activity_category
      WHERE category_id = $1;
      `,
      [category_id]
    );

    return result.rows[0];
  }

  // Search exact category name
  static async getByName(name) {
    const result = await pool.query(
      `
      SELECT
        category_id,
        name,
        description
      FROM public.activity_category
      WHERE LOWER(name) = LOWER($1);
      `,
      [name]
    );

    return result.rows[0];
  }

  // Search category by name
  static async search(name) {
    const result = await pool.query(
      `
      SELECT
        category_id,
        name,
        description
      FROM public.activity_category
      WHERE name ILIKE $1
      ORDER BY name;
      `,
      [`%${name}%`]
    );

    return result.rows;
  }

  // Update category
  static async update(category_id, data) {
    if (!category_id) {
      throw new Error("Category ID required");
    }

    if (!data.name) {
      throw new Error("Category name required");
    }

    const result = await pool.query(
      `
      UPDATE public.activity_category
      SET
        name = $1,
        description = $2
      WHERE category_id = $3
      RETURNING *;
      `,
      [
        data.name,
        data.description || "",
        category_id
      ]
    );

    if (!result.rows[0]) {
      throw new Error("Category not found or update failed");
    }

    return result.rows[0];
  }

  // Delete category
  static async delete(category_id) {
    if (!category_id) {
      throw new Error("Category ID required");
    }

    const result = await pool.query(
      `
      DELETE FROM public.activity_category
      WHERE category_id = $1
      RETURNING *;
      `,
      [category_id]
    );

    if (!result.rows[0]) {
      throw new Error("Delete failed");
    }

    return result.rows[0];
  }
}

module.exports = ActivityCategory;