const express = require('express');
const router = express.Router();
const { Attendance, User } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const SECRET = "token"; // Ideally use process.env.JWT_SECRET

// 🔒 Utility: Extract user ID from JWT
const getUserIdFromToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded.id;
  } catch (err) {
    console.error("JWT error:", err.message);
    return null;
  }
};

// ✅ POST /checkin
router.post('/checkin', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ 
      where: {
        userId,
        checkInTime: { [Op.gte]: today },
        checkOutTime: null
      }
    });

    if (existing) {
      return res.status(400).json({ message: "You must check out before checking in again." });
    }

    const newRecord = await Attendance.create({ userId, checkInTime: new Date() });
    return res.json({ message: "Checked in", record: newRecord });

  } catch (err) {
    console.error("Check-in error:", err.message);
    return res.status(500).json({ message: "Server error during check-in." });
  }
});

// ✅ POST /checkout — with ⏱️ hoursWorked auto-update
router.post('/checkout', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({
      where: {
        userId,
        checkInTime: { [Op.gte]: today },
        checkOutTime: null
      },
      order: [['checkInTime', 'DESC']]
    });

    if (!record) {
      return res.status(400).json({ message: "No active check-in found." });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(record.checkInTime);
    const durationMs = checkOutTime - checkInTime;
    const hoursWorked = durationMs / (1000 * 60 * 60); // convert ms to hours

    // Save checkout time to attendance record
    record.checkOutTime = checkOutTime;
    await record.save();

    // Update user's total hoursWorked
    const user = await User.findByPk(userId);
    if (user) {
      user.hoursWorked = (user.hoursWorked || 0) + hoursWorked;
      await user.save();
    }

    return res.json({ message: "Checked out", record });

  } catch (err) {
    console.error("Check-out error:", err.message);
    return res.status(500).json({ message: "Server error during check-out." });
  }
});

module.exports = router;