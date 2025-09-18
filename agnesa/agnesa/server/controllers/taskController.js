const db = require('../models');
const Task = db.Task;
const User = db.User;
const jwt = require('jsonwebtoken');

const SECRET = "token";

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

// HR creates a task
exports.createTask = async (req, res) => {
  const creatorId = getUserIdFromToken(req);
  const { userId, title, description, deadline, priority } = req.body;

  try {
    const creator = await User.findByPk(creatorId);
    if (!creator || creator.role !== "hr") {
      return res.status(403).json({ message: "Only HR can assign tasks" });
    }

    const task = await Task.create({
      userId,
      title,
      description,
      deadline,
      priority,
      creatorId
    });

    res.status(201).json({ message: "Task created", task });

  } catch (err) {
    console.error("Task create error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Employee views their tasks
exports.getMyTasks = async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const tasks = await Task.findAll({
      where: { userId },
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }]
    });

    res.json(tasks);
  } catch (err) {
    console.error("Task fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};