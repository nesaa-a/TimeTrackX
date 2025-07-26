// server/routes/auth.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await new sql.Request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE Username = @username');
    const user = result.recordset[0];
    if (!user) return res.status(401).send('Invalid credentials');
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(401).send('Invalid credentials');
    const token = jwt.sign(
      { userId: user.UserId, roleId: user.RoleId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// GET /users/me
router.get('/users/me', async (req, res) => {
  try {
    const userId = req.user.userId;
    const r = await new sql.Request()
      .input('userId', sql.Int, userId)
      .query(
        `SELECT u.UserId, u.Username, r.Name AS roleName, e.FirstName, e.LastName
         FROM Users u
         JOIN Roles r ON u.RoleId = r.RoleId
         JOIN Employees e ON u.EmployeeId = e.EmployeeId
         WHERE u.UserId = @userId`
      );
    if (!r.recordset.length) return res.sendStatus(404);
    res.json(r.recordset[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;