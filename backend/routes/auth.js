
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

// Signup route
router.post("/signup", async (req, res) => {
  const { username, name, email, password, adminKey } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const normalizedUsername = (username || name || "").trim();
  if (!normalizedUsername) {
    return res.status(400).json({ message: "Username is required" });
  }

  const existingUser = await Admin.findOne({ username: normalizedUsername });
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const normalizedEmail = email?.trim();
  if (normalizedEmail) {
    const existingEmail = await Admin.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  let role = "user";
  if (adminKey) {
    if (adminKey === process.env.AdminKey) {
      role = "admin";
    } else {
      return res
        .status(401)
        .json({ message: "Invalid Admin Key, Registration denied" });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await Admin.create({
    username: normalizedUsername,
    passwordHash: hashedPassword,
    role: role,
    email: normalizedEmail || undefined,
  });

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res
    .status(200)
    .json({ message: "User created successfully", user: user, token: token });
});
// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await Admin.findOne({ username: username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token: token, message: "Login Successful", role: user.role });
});

module.exports = router;