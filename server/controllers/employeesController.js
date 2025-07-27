const sql = require('mssql');
const dbConfig = require('../db/db');

exports.getAllEmployees = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Employees');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Employees WHERE Id = @id');
        if (result.recordset.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createEmployee = async (req, res) => {
    const { FirstName, LastName, Email, Position, Salary, HireDate, DepartmentId } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('FirstName', sql.NVarChar, FirstName)
            .input('LastName', sql.NVarChar, LastName)
            .input('Email', sql.NVarChar, Email)
            .input('Position', sql.NVarChar, Position)
            .input('Salary', sql.Decimal, Salary)
            .input('HireDate', sql.Date, HireDate)
            .input('DepartmentId', sql.Int, DepartmentId)
            .query(`INSERT INTO Employees (FirstName, LastName, Email, Position, Salary, HireDate, DepartmentId) 
                    VALUES (@FirstName, @LastName, @Email, @Position, @Salary, @HireDate, @DepartmentId)`);
        res.status(201).json({ message: 'Employee created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateEmployee = async (req, res) => {
    const { FirstName, LastName, Email, Position, Salary, HireDate, DepartmentId } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('FirstName', sql.NVarChar, FirstName)
            .input('LastName', sql.NVarChar, LastName)
            .input('Email', sql.NVarChar, Email)
            .input('Position', sql.NVarChar, Position)
            .input('Salary', sql.Decimal, Salary)
            .input('HireDate', sql.Date, HireDate)
            .input('DepartmentId', sql.Int, DepartmentId)
            .query(`UPDATE Employees SET FirstName=@FirstName, LastName=@LastName, Email=@Email, Position=@Position, 
                    Salary=@Salary, HireDate=@HireDate, DepartmentId=@DepartmentId WHERE Id = @id`);
        res.json({ message: 'Employee updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Employees WHERE Id = @id');
        res.json({ message: 'Employee deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
