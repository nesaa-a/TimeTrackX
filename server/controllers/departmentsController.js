const sql = require('mssql');
const dbConfig = require('../db/db');

exports.getAllDepartments = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Departments');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDepartmentById = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Departments WHERE DepartmentId = @id');
        if (result.recordset.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createDepartment = async (req, res) => {
    const { Name, Description } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Name', sql.NVarChar, Name)
            .input('Description', sql.NVarChar, Description)
            .query('INSERT INTO Departments (Name, Description) VALUES (@Name, @Description)');
        res.status(201).json({ message: 'Department created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateDepartment = async (req, res) => {
    const { Name, Description } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('Name', sql.NVarChar, Name)
            .input('Description', sql.NVarChar, Description)
            .query('UPDATE Departments SET Name=@Name, Description=@Description WHERE DepartmentId = @id');
        res.json({ message: 'Department updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Departments WHERE DepartmentId = @id');
        res.json({ message: 'Department deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
