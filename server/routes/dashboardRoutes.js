const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const moment = require('moment');
const db = require('../models');

const User = db.User;
const Task = db.Task || {};
const Attendance = db.Attendance;

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();

    const today = moment().startOf('day').toDate();
    const tomorrow = moment().add(1, 'day').startOf('day').toDate();

    const checkInsToday = await Attendance.count({
      where: {
        checkInTime: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    const totalTasks = await Task?.count?.() || 0;
    const completedTasks = await Task?.count?.({ where: { status: 'completed' } }) || 0;

    const activeSessions = await Attendance.count({
      where: {
        checkInTime: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
        checkoutTime: null
      }
    });

    // 👇 Get all users and today's attendance
    const users = await User.findAll({ attributes: ['id'] });
    const attendance = await Attendance.findAll({
      where: {
        checkInTime: { [Op.gte]: today }
      },
      order: [['checkInTime', 'DESC']]
    });

    const statusMap = {};

    attendance.forEach(record => {
      if (!statusMap[record.userId]) {
        statusMap[record.userId] = record.checkoutTime ? "Checked Out" : "Checked In";
      }
    });

    let checkedIn = 0, checkedOut = 0, notCheckedIn = 0;
    users.forEach(user => {
      const status = statusMap[user.id] || "Not Checked In";
      if (status === "Checked In") checkedIn++;
      else if (status === "Checked Out") checkedOut++;
      else notCheckedIn++;
    });

    res.json({
      totalUsers,
      checkInsToday,
      totalTasks,
      completedTasks,
      activeSessions,
      userStatusBreakdown: {
        checkedIn,
        checkedOut,
        notCheckedIn
      }
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;