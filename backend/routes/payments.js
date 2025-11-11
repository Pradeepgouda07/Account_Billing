const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment"); // your Mongoose model

// GET all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 });
    res.json(payments); // returns array
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new payment
router.post("/", async (req, res) => {
  try {
    const { amount, description } = req.body;
    const newPayment = new Payment({ amount, description });
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
