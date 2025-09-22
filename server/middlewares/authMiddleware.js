const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, "token");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid token");
    return res.status(403).json({ message: "Forbidden" });
  }
};