const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth"); // your JWT or session middleware
const Ledger = require("../models/Ledger"); // assuming you have a Mongoose model

// ✅ GET /api/ledger — get all ledger entries (protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const ledgerEntries = await Ledger.find().sort({ date: -1 });
    res.json(ledgerEntries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /api/ledger — add a new ledger entry (protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { type, amount, description } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ error: "Type and amount are required." });
    }

    const newEntry = new Ledger({
      type, // e.g., "credit" or "debit"
      amount,
      description,
      userId: req.user.id, // if verifyToken attaches user info
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
