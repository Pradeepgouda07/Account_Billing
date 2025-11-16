const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Admin = require("../models/Admin");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Expense = require("../models/Expense");

// GET admin dashboard stats
router.get("/stats", async (req, res) => {
  try {
    // Count total users
    const totalUsers = await Admin.countDocuments();
    
    // Count admin users
    const adminUsers = await Admin.countDocuments({ role: "admin" });
    
    // Count regular users
    const regularUsers = await Admin.countDocuments({ role: "user" });
    
    // Count total invoices across all users
    const totalInvoices = await Invoice.countDocuments();
    
    // Count total payments
    const totalPayments = await Payment.countDocuments();
    
    // Count total expenses
    const totalExpenses = await Expense.countDocuments();

    res.json({
      totalUsers,
      adminUsers,
      regularUsers,
      totalInvoices,
      totalPayments,
      totalExpenses,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all users
router.get("/users", async (req, res) => {
  try {
    const users = await Admin.find()
      .select("-passwordHash -__v")
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await Admin.findById(userId).select("-passwordHash -__v");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH update user role
router.patch("/users/:id/role", async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const validRoles = ["admin", "user"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: "Valid role is required (admin or user)" });
    }

    // Prevent admin from removing their own admin role
    if (req.user.id === userId && role === "user") {
      return res.status(400).json({ error: "You cannot remove your own admin role" });
    }

    const user = await Admin.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true }
    ).select("-passwordHash -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE user
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const user = await Admin.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deleting admin users (optional safety check)
    if (user.role === "admin") {
      return res.status(400).json({ error: "Cannot delete admin users" });
    }

    await Admin.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all invoices (admin view)
router.get("/invoices", async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const invoices = await Invoice.find(query)
      .select("-__v")
      .sort({ issueDate: -1 })
      .limit(parseInt(limit))
      .populate("userId", "username email");
    
    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all payments (admin view)
router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find()
      .select("-__v")
      .sort({ date: -1 })
      .limit(100)
      .populate("userId", "username email");
    
    res.json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all expenses (admin view)
router.get("/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find()
      .select("-__v")
      .sort({ date: -1 })
      .limit(100)
      .populate("userId", "username email");
    
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;


