const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // attach decoded token payload (e.g. user info) to req
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

const requireRole = () => (req, res, next) => {
  const role= req.body;
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden. You do not have the required role." });
  }
  next();
};

module.exports = { verifyToken, requireRole };
