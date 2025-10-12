const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Dummy users for demo (replace with DB)
const users = [
  { id: 1, username: "admin", passwordHash: bcrypt.hashSync("admin123", 10), role: "admin" },
  { id: 2, username: "user", passwordHash: bcrypt.hashSync("user123", 10), role: "user" },
];

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ message: "Invalid username or password" });

  const validPass = await bcrypt.compare(password, user.passwordHash);
  if (!validPass) return res.status(400).json({ message: "Invalid username or password" });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

module.exports = router;
