// server/routes/employees.js
const express = require('express');
const router = express.Router();
// Import poolPromise and sql types from utils/db
const { poolPromise, sql } = require('../utils/db');

// GET /employees — list with optional search, pagination
router.get('/', async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const pattern = `%${search}%`;
  try {
    const pool = await poolPromise;
    // Count total records
    const countResult = await pool.request()
      .input('pattern', sql.NVarChar, pattern)
      .query(
        `SELECT COUNT(*) AS total
         FROM Employees
         WHERE FirstName LIKE @pattern
            OR LastName  LIKE @pattern
            OR Position  LIKE @pattern`
      );
    const total = countResult.recordset[0].total;

    // Fetch paginated data
    const dataResult = await pool.request()
      .input('pattern', sql.NVarChar, pattern)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit, 10))
      .query(
        `SELECT *
         FROM Employees
         WHERE FirstName LIKE @pattern
            OR LastName  LIKE @pattern
            OR Position  LIKE @pattern
         ORDER BY EmployeeId
         OFFSET @offset ROWS
         FETCH NEXT @limit ROWS ONLY`
      );

    res.json({ total, page: +page, limit: +limit, data: dataResult.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// GET /employees/:id — get a single employee by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Employees WHERE EmployeeId = @id');
    if (!result.recordset.length) return res.sendStatus(404);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// POST /employees — create a new employee
router.post('/', async (req, res) => {
  const { FirstName, LastName, Email, Position, Salary, HireDate, DepartmentId } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('FirstName', sql.NVarChar(100), FirstName)
      .input('LastName',  sql.NVarChar(100), LastName)
      .input('Email',     sql.NVarChar(100), Email)
      .input('Position',  sql.NVarChar(100), Position)
      .input('Salary',    sql.Decimal(10, 2), Salary)
      .input('HireDate',  sql.Date, HireDate)
      .input('DepartmentId', sql.Int, DepartmentId)
      .query(
        `INSERT INTO Employees
         (FirstName, LastName, Email, Position, Salary, HireDate, DepartmentId)
         VALUES (@FirstName, @LastName, @Email, @Position, @Salary, @HireDate, @DepartmentId);
         SELECT SCOPE_IDENTITY() AS EmployeeId;`
      );
    res.status(201).json({ EmployeeId: result.recordset[0].EmployeeId });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// PUT /employees/:id — update an existing employee
router.put('/:id', async (req, res) => {
  const { FirstName, LastName, Email, Position, Salary, HireDate, DepartmentId } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id',          sql.Int,       req.params.id)
      .input('FirstName',   sql.NVarChar(100), FirstName)
      .input('LastName',    sql.NVarChar(100), LastName)
      .input('Email',       sql.NVarChar(100), Email)
      .input('Position',    sql.NVarChar(100), Position)
      .input('Salary',      sql.Decimal(10,2), Salary)
      .input('HireDate',    sql.Date,         HireDate)
      .input('DepartmentId',sql.Int,          DepartmentId)
      .query(
        `UPDATE Employees
         SET FirstName=@FirstName,
             LastName=@LastName,
             Email=@Email,
             Position=@Position,
             Salary=@Salary,
             HireDate=@HireDate,
             DepartmentId=@DepartmentId
         WHERE EmployeeId = @id`
      );
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// DELETE /employees/:id — delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Employees WHERE EmployeeId = @id');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
