// server/middlewares/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "supersekret";

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid/Expired token" });
        req.user = user; // Mundesh me përdor te controllers: req.user.userId, req.user.roleId etj.
        next();
    });
}
module.exports = { authenticateToken };
