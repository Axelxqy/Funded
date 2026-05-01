/* ============================================================
   PLATFORM MANAGER BACKEND CONTROLLER
   Place in: controller/platformManagerController_back.js
============================================================ */

const pool = require("../helper/db");

// GET all categories
const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category_id, category_name, category_desc, created_at
       FROM public.activity_category
       ORDER BY category_name ASC`
    );
    res.status(200).json({ categories: result.rows });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error while fetching categories." });
  }
};

// GET single category by ID
const getCategoryById = async (req, res) => {
  const { category_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT category_id, category_name, category_desc, created_at
       FROM public.activity_category
       WHERE category_id = $1`,
      [category_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ category: result.rows[0] });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: "Server error while fetching category." });
  }
};

// CREATE category
const createCategory = async (req, res) => {
  const { category_name, category_desc } = req.body;
  try {
    if (!category_name) {
      return res.status(400).json({ message: "Category name is required." });
    }
    const result = await pool.query(
      `INSERT INTO public.activity_category (category_name, category_desc)
       VALUES ($1, $2)
       RETURNING category_id, category_name, category_desc, created_at`,
      [category_name, category_desc || '']
    );
    res.status(201).json({ message: "Category created.", category: result.rows[0] });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error while creating category." });
  }
};

// UPDATE category
const updateCategory = async (req, res) => {
  const { category_id } = req.params;
  const { category_name, category_desc } = req.body;
  try {
    if (!category_name) {
      return res.status(400).json({ message: "Category name is required." });
    }
    const result = await pool.query(
      `UPDATE public.activity_category
       SET category_name = $1, category_desc = $2
       WHERE category_id = $3
       RETURNING category_id, category_name, category_desc`,
      [category_name, category_desc || '', category_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ message: "Category updated.", category: result.rows[0] });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Server error while updating category." });
  }
};

// DELETE category
const deleteCategory = async (req, res) => {
  const { category_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM public.activity_category WHERE category_id = $1 RETURNING category_id`,
      [category_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ message: "Category deleted." });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Server error while deleting category." });
  }
};

// GET reports — daily, weekly, monthly (placeholder, connect to real data as needed)
const getDailyReport = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS new_users
       FROM public.user_account
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    res.status(200).json({ report: result.rows[0] });
  } catch (error) {
    console.error("Daily report error:", error);
    res.status(500).json({ message: "Server error while fetching daily report." });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS new_users
       FROM public.user_account
       WHERE created_at >= NOW() - INTERVAL '7 days'`
    );
    res.status(200).json({ report: result.rows[0] });
  } catch (error) {
    console.error("Weekly report error:", error);
    res.status(500).json({ message: "Server error while fetching weekly report." });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS new_users
       FROM public.user_account
       WHERE created_at >= NOW() - INTERVAL '30 days'`
    );
    res.status(200).json({ report: result.rows[0] });
  } catch (error) {
    console.error("Monthly report error:", error);
    res.status(500).json({ message: "Server error while fetching monthly report." });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
};