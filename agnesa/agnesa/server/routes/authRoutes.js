const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Session check route
router.get('/session', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Get the token from "Bearer <token>"

  try {
    const decoded = jwt.verify(token, "token");
    return res.json({ userId: decoded.id, role: decoded.role });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;