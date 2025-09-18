const db = require('../models');
const User = db.User;
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      "token", // 🔒 hardcoded here as requested
      { expiresIn: "1h" }
    );

    return res.json({
      user: { id: user.id, name: user.name, role: user.role },
      accessToken: token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};