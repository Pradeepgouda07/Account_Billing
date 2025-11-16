const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const Expense = require("../models/Expense");

// GET all expenses for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST add a new expense
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ error: "Title and amount are required." });
    }

    const newExpense = new Expense({
      title,
      amount: Number(amount),
      category: category || "",
      description: description || "",
      date: date || Date.now(),
      userId: req.user.id,
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE expense
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;





