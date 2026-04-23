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
      `SELECT email, password
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

    res.status(200).json({
      message: "Login successful."
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

module.exports = {
  signup,
  login
};