const express = require("express");
const router = express.Router();
const { User, Attendance } = require("../models");
const jwt = require("jsonwebtoken");

const SECRET = "token"; // Move to .env if needed

// Helper to extract userId from JWT token
function getUserIdFromToken(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded.id;
  } catch (err) {
    console.error("Invalid token:", err.message);
    return null;
  }
}

// ✅ GET /api/profile
router.get("/", async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "role", "avatarUrl", "createdAt"]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const totalHoursWorked = await Attendance.sum("hoursWorked", {
      where: { userId }
    });

    return res.json({
      profile: {
        ...user.toJSON(),
        totalHoursWorked: totalHoursWorked || 0
      }
    });

  } catch (err) {
    console.error("Profile fetch error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /api/profile — update name
router.put("/", async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { name } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name;
    await user.save();

    return res.json({ message: "Name updated successfully" });

  } catch (err) {
    console.error("Name update error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /api/profile/password — update password
router.put("/password", async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { currentPassword, newPassword } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: "Password changed successfully" });

  } catch (err) {
    console.error("Password update error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;