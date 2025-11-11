const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth"); // your JWT auth middleware
const Expense = require("../models/Expense"); // Mongoose model

// ✅ GET /api/expenses — get all expenses (protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    // Optionally filter by logged-in user
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /api/expenses — add a new expense (protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ error: "Title and amount are required." });
    }

    const newExpense = new Expense({
      title,
      amount,
      category,
      description,
      date: date || Date.now(),
      userId: req.user.id, // attach user from token
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE /api/expenses/:id — remove an expense
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedExpense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedExpense)
      return res.status(404).json({ error: "Expense not found or unauthorized." });

    res.json({ message: "Expense deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
