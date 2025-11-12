const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const Payment = require("../models/Payment");

// GET all payments for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST add new payment
router.post("/", verifyToken, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const newPayment = new Payment({
      amount: Number(amount),
      description: description || "",
      userId: req.user.id,
    });

    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE payment
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error("Error deleting payment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
