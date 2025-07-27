const sql = require('mssql');
const dbConfig = require('../db/db');

// Get all roles
exports.getAllRoles = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Roles');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Roles WHERE RoleId = @id');
        if (result.recordset.length === 0)
            return res.status(404).json({ message: "Role not found" });
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new role
exports.createRole = async (req, res) => {
    const { Name } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Name', sql.NVarChar, Name)
            .query('INSERT INTO Roles (Name) VALUES (@Name)');
        res.status(201).json({ message: 'Role created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update role
exports.updateRole = async (req, res) => {
    const { Name } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('Name', sql.NVarChar, Name)
            .query('UPDATE Roles SET Name=@Name WHERE RoleId = @id');
        res.json({ message: 'Role updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete role
exports.deleteRole = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Roles WHERE RoleId = @id');
        res.json({ message: 'Role deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
