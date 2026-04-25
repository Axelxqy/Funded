const pool = require("../helper/db");

const signup = async (req, res) => {
  const { email, password, f_name, l_name, dob, phone } = req.body;

  try {
    if (!email || !password || !f_name || !l_name || !dob || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await pool.query(
      "SELECT user_id FROM public.user_account WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const result = await pool.query(
      `INSERT INTO public.user_account (email, password, f_name, l_name, dob, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, email, f_name, l_name, dob, phone`,
      [email, password, f_name, l_name, dob, phone]
    );

    res.status(201).json({
      message: "Signup successful.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT user_id, email, password, f_name, l_name, dob, phone
       FROM public.user_account
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found." });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Wrong password." });
    }

    delete user.password;

    res.status(200).json({
      message: "Login successful.",
      user: user
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

const getProfile = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT user_id, email, f_name, l_name, dob, phone
       FROM public.user_account
       WHERE user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error while loading profile." });
  }
};

const updateProfile = async (req, res) => {
  const { user_id } = req.params;
  const { f_name, l_name, dob, phone } = req.body;

  try {
    if (!f_name || !l_name || !dob || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await pool.query(
      `UPDATE public.user_account
       SET f_name = $1,
           l_name = $2,
           dob = $3,
           phone = $4
       WHERE user_id = $5
       RETURNING user_id, email, f_name, l_name, dob, phone`,
      [f_name, l_name, dob, phone, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile
};