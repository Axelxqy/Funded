const pool = require("../helper/db");

// GET all users with their role
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ua.user_id,
        ua.email,
        ua.f_name,
        ua.l_name,
        ua.dob,
        ua.phone,
        ua.suspended,
        ua.profile_id,
        up.role_name
       FROM public.user_account ua
       LEFT JOIN public.user_profile up ON ua.profile_id = up.profile_id
       ORDER BY ua.f_name ASC`
    );
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};

// GET single user by ID
const getUserById = async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        ua.user_id,
        ua.email,
        ua.f_name,
        ua.l_name,
        ua.dob,
        ua.phone,
        ua.suspended,
        ua.profile_id,
        up.role_name
       FROM public.user_account ua
       LEFT JOIN public.user_profile up ON ua.profile_id = up.profile_id
       WHERE ua.user_id = $1`,
      [user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error while fetching user." });
  }
};

// UPDATE user (edit)
const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { f_name, l_name, email, phone, profile_id } = req.body;
  try {
    if (!f_name || !l_name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }
    const result = await pool.query(
      `UPDATE public.user_account
       SET f_name = $1,
           l_name = $2,
           email = $3,
           phone = $4,
           profile_id = $5
       WHERE user_id = $6
       RETURNING user_id, email, f_name, l_name, phone, suspended, profile_id`,
      [f_name, l_name, email, phone, profile_id, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User updated.", user: result.rows[0] });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error while updating user." });
  }
};

// TOGGLE suspend/activate user
const toggleSuspendUser = async (req, res) => {
  const { user_id } = req.params;
  try {
    // Get current status first
    const current = await pool.query(
      `SELECT suspended FROM public.user_account WHERE user_id = $1`,
      [user_id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    const newStatus = !current.rows[0].suspended;
    const result = await pool.query(
      `UPDATE public.user_account
       SET suspended = $1
       WHERE user_id = $2
       RETURNING user_id, suspended`,
      [newStatus, user_id]
    );
    res.status(200).json({
      message: newStatus ? "User suspended." : "User reactivated.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Toggle suspend error:", error);
    res.status(500).json({ message: "Server error while updating status." });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM public.user_account WHERE user_id = $1 RETURNING user_id`,
      [user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error while deleting user." });
  }
};

// GET all roles
const getAllRoles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT profile_id, role_name, role_desc FROM public.user_profile ORDER BY profile_id ASC`
    );
    res.status(200).json({ roles: result.rows });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ message: "Server error while fetching roles." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  toggleSuspendUser,
  deleteUser,
  getAllRoles
};