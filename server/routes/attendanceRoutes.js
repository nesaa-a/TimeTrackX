const express = require("express");
const router = express.Router();

// ✅ FIX: Import the correct controller
const controller = require("../controllers/attendanceController");

router.post("/checkin", controller.checkIn);
router.post("/checkout", controller.checkOut);
router.get("/active", controller.getActiveCheckIn);
router.get("/history", controller.getHistory);
router.get("/statuses", controller.getUserStatuses);

module.exports = router;