// server/routes/projects.js
const express = require('express');
const router = express.Router();
// Import poolPromise and sql types from utils/db
const { poolPromise, sql } = require('../utils/db');

// GET /projects — retrieve all projects
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Projects');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// GET /projects/:id — retrieve a single project by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Projects WHERE ProjectId = @id');
    if (!result.recordset.length) return res.sendStatus(404);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// POST /projects — create a new project
router.post('/', async (req, res) => {
  const { Name, Description, StartDate, EndDate } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Name', sql.NVarChar(100), Name)
      .input('Description', sql.NVarChar(255), Description)
      .input('StartDate', sql.Date, StartDate)
      .input('EndDate', sql.Date, EndDate)
      .query(`
        INSERT INTO Projects (Name, Description, StartDate, EndDate)
        VALUES (@Name, @Description, @StartDate, @EndDate);
        SELECT SCOPE_IDENTITY() AS ProjectId;
      `);
    res.status(201).json({ ProjectId: result.recordset[0].ProjectId });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// PUT /projects/:id — update an existing project
router.put('/:id', async (req, res) => {
  const { Name, Description, StartDate, EndDate } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('Name', sql.NVarChar(100), Name)
      .input('Description', sql.NVarChar(255), Description)
      .input('StartDate', sql.Date, StartDate)
      .input('EndDate', sql.Date, EndDate)
      .query(`
        UPDATE Projects
        SET Name = @Name,
            Description = @Description,
            StartDate = @StartDate,
            EndDate = @EndDate
        WHERE ProjectId = @id
      `);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// DELETE /projects/:id — delete a project
router.delete('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Projects WHERE ProjectId = @id');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;