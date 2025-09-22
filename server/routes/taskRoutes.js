const express = require("express");
const router = express.Router();
const { Task, User } = require("../models");
const jwt = require("jsonwebtoken");

const SECRET = "token"; // Move to .env in production

// Helper to extract user ID from JWT
function getUserIdFromToken(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

// ✅ POST /api/tasks — HR assigns task to employee
router.post("/", async (req, res) => {
  const creatorId = getUserIdFromToken(req);
  if (!creatorId) return res.status(401).json({ message: "Unauthorized" });

  const { userId, title, description, deadline, priority } = req.body;

  if (!userId || !title || !description || !deadline || !priority) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const creator = await User.findByPk(creatorId);
    if (!creator || creator.role !== "hr") {
      return res.status(403).json({ message: "Only HR can assign tasks" });
    }

    const newTask = await Task.create({
      userId,        // Assignee (employee)
      title,
      description,
      deadline,
      priority,
      creatorId      // HR who assigned the task
    });

    res.status(201).json({ message: "Task assigned", task: newTask });
  } catch (err) {
    console.error("Assign task error:", err.message);
    res.status(500).json({ message: "Failed to assign task" });
  }
});

// ✅ GET /api/tasks/mine — tasks assigned to the logged-in user
router.get("/mine", async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const tasks = await Task.findAll({
      where: { userId }, // This is the assignee
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
      order: [["deadline", "ASC"]],
    });

    res.json(tasks);
  } catch (err) {
    console.error("Fetch tasks error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;