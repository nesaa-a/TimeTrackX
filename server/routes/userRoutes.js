const express = require("express");
const router = express.Router();
const { User, Attendance, sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const userController = require("../controllers/userController");

const SECRET = "token"; // 🔒 Move this to .env in production

// Extract user ID from token
function getUserIdFromToken(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET).id;
  } catch (err) {
    console.error("Token error:", err.message);
    return null;
  }
}

// GET /api/users/employers
router.get("/employers", requireHR, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "employer" },
      attributes: ["id", "name", "email"]
    });
    res.json({ users });
  } catch (err) {
    console.error("Employer list error:", err.message);
    res.status(500).json({ message: "Error fetching employers" });
  }
});

// Middleware to restrict to HR only
async function requireHR(req, res, next) {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findByPk(userId);
  if (!user || user.role !== "hr") {
    return res.status(403).json({ message: "Access denied" });
  }

  req.hrUser = user;
  next();
}

// ====================== PUBLIC OR AUTH ROUTES ======================

// POST /api/users/create
router.post("/create", userController.createUser);

// ====================== SELF PROFILE ROUTES ======================

// GET /api/users/profile
router.get("/profile", async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "avatarUrl",
        "createdAt"
      ],
      include: [
        {
          model: Attendance,
          attributes: []
        }
      ],
      group: ["User.id"],
      attributes: {
        include: [
          [
            sequelize.fn(
              "ROUND",
              sequelize.fn(
                "SUM",
                sequelize.literal("TIMESTAMPDIFF(SECOND, `Attendances`.`checkInTime`, `Attendances`.`checkOutTime`) / 3600")
              ),
              2
            ),
            "hoursWorked"
          ]
        ]
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/profile
router.put("/profile", async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { name } = req.body;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    await user.save();
    res.json({ message: "Name updated successfully" });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/password
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
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ====================== HR ADMIN ROUTES ======================

// GET /api/users/all
router.get("/all", requireHR, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "avatarUrl",
        "createdAt",
        [
          sequelize.fn(
            "ROUND",
            sequelize.fn(
              "SUM",
              sequelize.literal("TIMESTAMPDIFF(SECOND, `Attendances`.`checkInTime`, `Attendances`.`checkOutTime`) / 3600")
            ),
            2
          ),
          "hoursWorked"
        ]
      ],
      include: [
        {
          model: Attendance,
          attributes: [],
          required: false
        }
      ],
      group: ["User.id"],
      order: [["createdAt", "DESC"]]
    });

    res.json({ users });
  } catch (err) {
    console.error("User list error:", err.message);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// PUT /api/users/:id
router.put("/:id", requireHR, async (req, res) => {
  const { name, role } = req.body;

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.role = role || user.role;
    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("User update error:", err.message);
    res.status(500).json({ message: "Error updating user" });
  }
});

// DELETE /api/users/:id
router.delete("/:id", requireHR, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("User delete error:", err.message);
    res.status(500).json({ message: "Error deleting user" });
  }
});

module.exports = router;