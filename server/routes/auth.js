const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT secret - mos e publiko këtë kurrë, ruaje në .env
const JWT_SECRET = process.env.JWT_SECRET || "supersekret";

// REGISTER (opsional, vetëm për demo!)
router.post('/register', async (req, res) => {
    const { EmployeeId, Username, Password, RoleId } = req.body;
    try {
        const pool = await sql.connect(dbConfig);

        // Kontrollo nëse ekziston Username
        const userCheck = await pool.request()
            .input('Username', sql.NVarChar, Username)
            .query('SELECT * FROM Users WHERE Username=@Username');
        if (userCheck.recordset.length > 0) {
            return res.status(409).json({ message: "Username already exists!" });
        }

        // Hash password-it
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Shto userin e ri
        await pool.request()
            .input('EmployeeId', sql.Int, EmployeeId)
            .input('Username', sql.NVarChar, Username)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .input('RoleId', sql.Int, RoleId)
            .query('INSERT INTO Users (EmployeeId, Username, PasswordHash, RoleId) VALUES (@EmployeeId, @Username, @PasswordHash, @RoleId)');

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { Username, Password } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const userResult = await pool.request()
            .input('Username', sql.NVarChar, Username)
            .query('SELECT * FROM Users WHERE Username=@Username');
        const user = userResult.recordset[0];

        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        // Kontrollo password-in
        const passwordMatch = await bcrypt.compare(Password, user.PasswordHash);
        if (!passwordMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Krijo JWT token
        const token = jwt.sign(
            {
                userId: user.UserId,
                username: user.Username,
                roleId: user.RoleId
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                userId: user.UserId,
                username: user.Username,
                roleId: user.RoleId
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
