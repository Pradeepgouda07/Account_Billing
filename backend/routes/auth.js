const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

// Login route
router.post("/login", async (req, res) => {
  const { username, password,role } = req.body;

const user0 = await Admin.findOne({username:username});
if (!user0){  
  res.json({
    message:"Username already exits"
  });
return ;
} 

  const validPass = await bcrypt.hash(password, 10);
  const user = await Admin.create({username:username,password:validPass,role:role})
 
  if (!validPass) return res.status(400).json({ message: "Invalid username or password" });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token:token,message:"Login Successfully" });
});

module.exports = router;
