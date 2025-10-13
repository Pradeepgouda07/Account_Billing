const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  email: { type: String, unique: true, sparse: true } 
});

module.exports = mongoose.model("Admin", AdminSchema);
