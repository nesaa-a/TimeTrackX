const sql = require('mssql');
const dbConfig = require('../db/db');

exports.getAllProjects = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Projects');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Projects WHERE ProjectId = @id');
        if (result.recordset.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProject = async (req, res) => {
    const { Name, Description, StartDate, EndDate } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Name', sql.NVarChar, Name)
            .input('Description', sql.NVarChar, Description)
            .input('StartDate', sql.Date, StartDate)
            .input('EndDate', sql.Date, EndDate)
            .query('INSERT INTO Projects (Name, Description, StartDate, EndDate) VALUES (@Name, @Description, @StartDate, @EndDate)');
        res.status(201).json({ message: 'Project created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProject = async (req, res) => {
    const { Name, Description, StartDate, EndDate } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('Name', sql.NVarChar, Name)
            .input('Description', sql.NVarChar, Description)
            .input('StartDate', sql.Date, StartDate)
            .input('EndDate', sql.Date, EndDate)
            .query('UPDATE Projects SET Name=@Name, Description=@Description, StartDate=@StartDate, EndDate=@EndDate WHERE ProjectId = @id');
        res.json({ message: 'Project updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Projects WHERE ProjectId = @id');
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
