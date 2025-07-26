// server/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
// Import poolPromise and sql types from utils/db
const { poolPromise, sql } = require('../utils/db');

// GET /users — list all users with roles and employee info
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(
        `SELECT u.UserId, u.Username, r.Name AS roleName,
                e.EmployeeId, e.FirstName, e.LastName
         FROM Users u
         JOIN Roles r ON u.RoleId = r.RoleId
         JOIN Employees e ON u.EmployeeId = e.EmployeeId`
      );
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// GET /users/:id — retrieve a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(
        `SELECT UserId, Username, RoleId, EmployeeId
         FROM Users
         WHERE UserId = @id`
      );
    if (!result.recordset.length) return res.sendStatus(404);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// POST /users — create a new user with hashed password
router.post('/', async (req, res) => {
  const { EmployeeId, Username, Password, RoleId } = req.body;
  try {
    const pool = await poolPromise;
    const hash = await bcrypt.hash(Password, 10);
    const result = await pool.request()
      .input('EmployeeId', sql.Int, EmployeeId)
      .input('Username', sql.NVarChar(50), Username)
      .input('PasswordHash', sql.NVarChar(255), hash)
      .input('RoleId', sql.Int, RoleId)
      .query(
        `INSERT INTO Users (EmployeeId, Username, PasswordHash, RoleId)
         VALUES (@EmployeeId, @Username, @PasswordHash, @RoleId);
         SELECT SCOPE_IDENTITY() AS UserId;`
      );
    res.status(201).json({ UserId: result.recordset[0].UserId });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// PUT /users/:id — update an existing user, optionally change password
router.put('/:id', async (req, res) => {
  const { EmployeeId, Username, RoleId, Password } = req.body;
  try {
    const pool = await poolPromise;
    let request = pool.request()
      .input('id', sql.Int, req.params.id)
      .input('EmployeeId', sql.Int, EmployeeId)
      .input('Username', sql.NVarChar(50), Username)
      .input('RoleId', sql.Int, RoleId);
    let query;
    if (Password) {
      const hash = await bcrypt.hash(Password, 10);
      request = request.input('PasswordHash', sql.NVarChar(255), hash);
      query = 
        `UPDATE Users
         SET EmployeeId    = @EmployeeId,
             Username      = @Username,
             RoleId        = @RoleId,
             PasswordHash  = @PasswordHash
         WHERE UserId = @id`;
    } else {
      query = 
        `UPDATE Users
         SET EmployeeId = @EmployeeId,
             Username   = @Username,
             RoleId     = @RoleId
         WHERE UserId = @id`;
    }
    await request.query(query);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// DELETE /users/:id — delete a user
router.delete('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Users WHERE UserId = @id');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
