const sql = require('mssql');
const dbConfig = require('../db/db');

exports.getAllUsers = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Users WHERE UserId = @id');
        if (result.recordset.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUser = async (req, res) => {
    const { EmployeeId, Username, PasswordHash, RoleId } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('EmployeeId', sql.Int, EmployeeId)
            .input('Username', sql.NVarChar, Username)
            .input('PasswordHash', sql.NVarChar, PasswordHash)
            .input('RoleId', sql.Int, RoleId)
            .query('INSERT INTO Users (EmployeeId, Username, PasswordHash, RoleId) VALUES (@EmployeeId, @Username, @PasswordHash, @RoleId)');
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { EmployeeId, Username, PasswordHash, RoleId } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('EmployeeId', sql.Int, EmployeeId)
            .input('Username', sql.NVarChar, Username)
            .input('PasswordHash', sql.NVarChar, PasswordHash)
            .input('RoleId', sql.Int, RoleId)
            .query('UPDATE Users SET EmployeeId=@EmployeeId, Username=@Username, PasswordHash=@PasswordHash, RoleId=@RoleId WHERE UserId = @id');
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Users WHERE UserId = @id');
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
