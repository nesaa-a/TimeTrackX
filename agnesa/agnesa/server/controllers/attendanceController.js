const db = require('../models');
const Attendance = db.Attendance;
const User = db.User;
const jwt = require('jsonwebtoken');

const SECRET = "token"; // You should move this to process.env

// Helper: Extract user ID from token
function getUserIdFromToken(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded.id;
  } catch (err) {
    console.error("JWT verify failed:", err);
    return null;
  }
}

// ✅ CHECK-IN
exports.checkIn = async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const today = new Date().toISOString().split("T")[0];

    // Block duplicate check-in if not checked out yet
    const last = await Attendance.findOne({
      where: {
        userId,
        checkInTime: { [db.Sequelize.Op.gte]: `${today}T00:00:00` },
        checkOutTime: null
      }
    });

    if (last) {
      return res.status(400).json({ message: "Already checked in today. Please check out first." });
    }

    const record = await Attendance.create({
      userId,
      checkInTime: new Date()
    });

    return res.json({ message: "Checked in", record });

  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CHECK-OUT
exports.checkOut = async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const today = new Date().toISOString().split("T")[0];

    const record = await Attendance.findOne({
      where: {
        userId,
        checkInTime: { [db.Sequelize.Op.gte]: `${today}T00:00:00` },
        checkOutTime: null
      },
      order: [['checkInTime', 'DESC']]
    });

    if (!record) {
      return res.status(400).json({ message: "No active check-in found today" });
    }

    const checkOutTime = new Date();
    const hours = Math.abs(checkOutTime - record.checkInTime) / (1000 * 60 * 60);
    const hoursWorked = parseFloat(hours.toFixed(2));

    record.checkOutTime = checkOutTime;
    record.hoursWorked = hoursWorked;
    await record.save();

    // Optional: update total hours on user (if tracked on user model)
    const user = await User.findByPk(userId);
    if (user && typeof user.hoursWorked === "number") {
      user.hoursWorked += hoursWorked;
      await user.save();
    }

    return res.json({ message: "Checked out", hoursWorked });

  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ACTIVE CHECK-IN (returns current active check-in time or null)
exports.getActiveCheckIn = async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const today = new Date().toISOString().split("T")[0];

    const record = await Attendance.findOne({
      where: {
        userId,
        checkInTime: { [db.Sequelize.Op.gte]: `${today}T00:00:00` },
        checkOutTime: null
      },
      order: [['checkInTime', 'DESC']]
    });

    return res.json({ checkInTime: record?.checkInTime || null });

  } catch (err) {
    console.error("Active check-in fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CHECK-IN HISTORY
exports.getHistory = async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const history = await Attendance.findAll({
      where: { userId },
      order: [['checkInTime', 'DESC']]
    });

    return res.json(history);

  } catch (err) {
    console.error("Fetch history error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ USER STATUSES (checked in, checked out, or not checked in today)
exports.getUserStatuses = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const users = await User.findAll();
    const attendance = await Attendance.findAll({
      where: {
        checkInTime: { [db.Sequelize.Op.gte]: `${today}T00:00:00` }
      },
      order: [['checkInTime', 'DESC']]
    });

    const statusMap = {};
    attendance.forEach(record => {
      if (!statusMap[record.userId]) {
        statusMap[record.userId] = record.checkOutTime ? "Checked Out" : "Checked In";
      }
    });

    const results = users.map(user => ({
      id: user.id,
      name: user.name,
      role: user.role,
      status: statusMap[user.id] || "Not Checked In"
    }));

    return res.json(results);

  } catch (err) {
    console.error("User statuses fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};