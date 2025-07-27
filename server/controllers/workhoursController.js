const sql = require('mssql');
const dbConfig = require('../db/db');

exports.getAllWorkHours = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM WorkHours');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWorkHourById = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM WorkHours WHERE WorkHoursId = @id');
        if (result.recordset.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createWorkHour = async (req, res) => {
    const { EmployeeId, ProjectId, WorkDate, Hours } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('EmployeeId', sql.Int, EmployeeId)
            .input('ProjectId', sql.Int, ProjectId)
            .input('WorkDate', sql.Date, WorkDate)
            .input('Hours', sql.Decimal, Hours)
            .query('INSERT INTO WorkHours (EmployeeId, ProjectId, WorkDate, Hours) VALUES (@EmployeeId, @ProjectId, @WorkDate, @Hours)');
        res.status(201).json({ message: 'Work hour created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateWorkHour = async (req, res) => {
    const { EmployeeId, ProjectId, WorkDate, Hours } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('EmployeeId', sql.Int, EmployeeId)
            .input('ProjectId', sql.Int, ProjectId)
            .input('WorkDate', sql.Date, WorkDate)
            .input('Hours', sql.Decimal, Hours)
            .query('UPDATE WorkHours SET EmployeeId=@EmployeeId, ProjectId=@ProjectId, WorkDate=@WorkDate, Hours=@Hours WHERE WorkHoursId = @id');
        res.json({ message: 'Work hour updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteWorkHour = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM WorkHours WHERE WorkHoursId = @id');
        res.json({ message: 'Work hour deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
