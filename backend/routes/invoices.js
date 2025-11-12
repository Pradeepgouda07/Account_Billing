const express = require("express");
const mongoose = require("mongoose");
const router = express.Router(); // ✅ you must declare this before using router
const { verifyToken } = require("../middleware/auth");
const Invoice = require("../models/Invoice");

// ✅ GET all invoices for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST add a new invoice
router.post("/", verifyToken, async (req, res) => {
  try {
    const { clientName, amount, description, dueDate } = req.body;

    if (!clientName || amount === undefined || amount === null) {
      return res.status(400).json({ error: "Client Name and Amount are required." });
    }

    const newInvoice = new Invoice({
      clientName,
      amount: Number(amount),
      description: description || "",
      dueDate: dueDate || Date.now(),
      userId: req.user.id,
    });

    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ DELETE invoice with debug logging
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    console.log("DELETE called for invoice:", req.params.id, "user:", req.user);

    const invoiceId = req.params.id;
    const userId = req.user.id || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      console.log("❌ Invalid invoice ID:", invoiceId);
      return res.status(400).json({ error: "Invalid invoice ID format" });
    }

    const deleted = await Invoice.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(invoiceId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!deleted) {
      console.log("❌ Invoice not found or not authorized");
      return res.status(404).json({ error: "Invoice not found or not authorized" });
    }

    console.log("✅ Invoice deleted successfully:", deleted._id);
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting invoice:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
