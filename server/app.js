const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');         // ✅ Includes /profile and /password
const attendanceRoutes = require('./routes/attendanceRoutes'); // ✅ Check-in, status, etc.
const profileRoutes = require('./routes/profileRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);              // ✅ all user/profile/password routes
app.use('/api/attendance', attendanceRoutes);   // ✅ check-in/out, status
app.use('/api/profile', profileRoutes);  // instead of userRoutes handling /profile
app.use("/api/tasks", require("./routes/taskRoutes"));// Health check
app.get('/', (req, res) => {
  res.send('HR Management API is running');
});

module.exports = app;