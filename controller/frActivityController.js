const pool = require("../helper/db");

// Create fundraising activity
const createActivity = async (req, res) => {
  const {
    activity_name,
    category_id,
    category_name,
    fundraise_goal,
    start_date,
    end_date,
    description,
    created_by,
  } = req.body;

  try {
    if (
      !activity_name ||
      !category_name ||
      !fundraise_goal ||
      !start_date ||
      !end_date ||
      !description ||
      !created_by
    ) {
      return res.status(400).json({
        message: "All required fields are needed.",
      });
    }

    let finalCategoryId = category_id;

    // If user typed Others, category_id will be null.
    // So create/find that category in activity_category table.
    if (!finalCategoryId) {
      const existingCategory = await pool.query(
        `SELECT category_id
         FROM public.activity_category
         WHERE LOWER(name) = LOWER($1)
         LIMIT 1`,
        [category_name]
      );

      if (existingCategory.rows.length > 0) {
        finalCategoryId = existingCategory.rows[0].category_id;
      } else {
        const newCategory = await pool.query(
          `INSERT INTO public.activity_category (name, description)
           VALUES ($1, $2)
           RETURNING category_id`,
          [category_name, `${category_name} fundraising campaigns`]
        );

        finalCategoryId = newCategory.rows[0].category_id;
      }
    }

    const result = await pool.query(
      `INSERT INTO public.fr_activity
       (activity_name, category_id, fundraise_goal, current_amount, start_date, end_date, status, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        activity_name,
        finalCategoryId,
        fundraise_goal,
        0,
        start_date,
        end_date,
        "Ongoing",
        description,
        created_by,
      ]
    );

    res.status(201).json({
      message: "Campaign created successfully.",
      activity: result.rows[0],
    });
  } catch (error) {
    console.error("Create activity error:", error);
    res.status(500).json({
      message: "Server error while creating campaign.",
      error: error.message,
    });
  }
};

// Get all fundraising activities
const getActivities = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         fa.activity_id,
         fa.activity_name,
         fa.category_id,
         ac.name AS category_name,
         fa.fundraise_goal,
         fa.current_amount,
         fa.start_date,
         fa.end_date,
         fa.status,
         fa.description
       FROM public.fr_activity fa
       LEFT JOIN public.activity_category ac
         ON fa.category_id = ac.category_id
       ORDER BY fa.activity_id DESC`
    );

    res.status(200).json({
      message: "Activities retrieved successfully.",
      activities: result.rows,
    });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({
      message: "Server error while retrieving campaigns.",
      error: error.message,
    });
  }
};

module.exports = {
  createActivity,
  getActivities,
};