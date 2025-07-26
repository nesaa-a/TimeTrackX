// server/routes/workhours.js
const express = require('express');
const router = express.Router();
// Import poolPromise and sql types from utils/db
const { poolPromise, sql } = require('../utils/db');

// GET /workhours — list all work hours with employee and project info
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(
        `SELECT w.WorkHoursId,
                w.WorkDate,
                w.Hours,
                e.EmployeeId,
                e.FirstName,
                e.LastName,
                p.ProjectId,
                p.Name AS ProjectName
         FROM WorkHours w
         JOIN Employees e ON w.EmployeeId = e.EmployeeId
         LEFT JOIN Projects p ON w.ProjectId = p.ProjectId`
      );
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// GET /workhours/:id — retrieve a single workhours entry by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM WorkHours WHERE WorkHoursId = @id');
    if (!result.recordset.length) return res.sendStatus(404);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// POST /workhours — create a new workhours entry
router.post('/', async (req, res) => {
  const { EmployeeId, ProjectId, WorkDate, Hours } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('EmployeeId', sql.Int, EmployeeId)
      .input('ProjectId', sql.Int, ProjectId)
      .input('WorkDate', sql.Date, WorkDate)
      .input('Hours', sql.Decimal(4,2), Hours)
      .query(
        `INSERT INTO WorkHours (EmployeeId, ProjectId, WorkDate, Hours)
         VALUES (@EmployeeId, @ProjectId, @WorkDate, @Hours);
         SELECT SCOPE_IDENTITY() AS WorkHoursId;`
      );
    res.status(201).json({ WorkHoursId: result.recordset[0].WorkHoursId });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// PUT /workhours/:id — update an existing workhours entry
router.put('/:id', async (req, res) => {
  const { EmployeeId, ProjectId, WorkDate, Hours } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('EmployeeId', sql.Int, EmployeeId)
      .input('ProjectId', sql.Int, ProjectId)
      .input('WorkDate', sql.Date, WorkDate)
      .input('Hours', sql.Decimal(4,2), Hours)
      .query(
        `UPDATE WorkHours
         SET EmployeeId = @EmployeeId,
             ProjectId  = @ProjectId,
             WorkDate   = @WorkDate,
             Hours      = @Hours
         WHERE WorkHoursId = @id`
      );
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// DELETE /workhours/:id — delete a workhours entry
router.delete('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM WorkHours WHERE WorkHoursId = @id');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
