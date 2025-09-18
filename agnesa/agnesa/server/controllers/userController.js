const db = require('../models');
const User = db.User;

exports.createUser = async (req, res) => {
  const { name, email, password, role, avatarUrl } = req.body;

  try {
    // Check for existing user
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create new user (password stored as plain text — as requested)
    const newUser = await User.create({
      name,
      email,
      password,
      role: role?.toLowerCase() || 'employer',
      avatarUrl: avatarUrl || null,
      hoursWorked: 0 // default hours
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};