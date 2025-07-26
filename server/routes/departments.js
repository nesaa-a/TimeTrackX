// server/routes/departments.js
const express = require('express');
const router = express.Router();
// Import poolPromise and sql types from utils/db
const { poolPromise, sql } = require('../utils/db');

// GET /departments — retrieve all departments
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Departments');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// GET /departments/:id — retrieve a single department by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Departments WHERE DepartmentId = @id');
    if (!result.recordset.length) return res.sendStatus(404);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// POST /departments — create a new department
router.post('/', async (req, res) => {
  const { Name, Description } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Name', sql.NVarChar(100), Name)
      .input('Description', sql.NVarChar(255), Description)
      .query(
        `INSERT INTO Departments (Name, Description)
         VALUES (@Name, @Description);
         SELECT SCOPE_IDENTITY() AS DepartmentId;`
      );
    res.status(201).json({ DepartmentId: result.recordset[0].DepartmentId });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// PUT /departments/:id — update an existing department
router.put('/:id', async (req, res) => {
  const { Name, Description } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('Name', sql.NVarChar(100), Name)
      .input('Description', sql.NVarChar(255), Description)
      .query(
        `UPDATE Departments
         SET Name = @Name,
             Description = @Description
         WHERE DepartmentId = @id`
      );
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// DELETE /departments/:id — delete a department
router.delete('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Departments WHERE DepartmentId = @id');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;