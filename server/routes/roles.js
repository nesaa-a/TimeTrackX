// server/routes/roles.js
const express = require('express');
const router = express.Router();
// Import poolPromise and sql types from utils/db
const { poolPromise, sql } = require('../utils/db');

// GET /roles — retrieve all roles
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Roles');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// GET /roles/:id — retrieve a single role by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Roles WHERE RoleId = @id');
    if (!result.recordset.length) return res.sendStatus(404);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// POST /roles — create a new role
router.post('/', async (req, res) => {
  const { Name } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Name', sql.NVarChar(50), Name)
      .query(
        `INSERT INTO Roles (Name) VALUES (@Name);
         SELECT SCOPE_IDENTITY() AS RoleId;`
      );
    res.status(201).json({ RoleId: result.recordset[0].RoleId });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// PUT /roles/:id — update an existing role
router.put('/:id', async (req, res) => {
  const { Name } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('Name', sql.NVarChar(50), Name)
      .query(
        `UPDATE Roles
         SET Name = @Name
         WHERE RoleId = @id;`
      );
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// DELETE /roles/:id — delete a role
router.delete('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Roles WHERE RoleId = @id');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
