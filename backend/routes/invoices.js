const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice"); // your Mongoose model

// GET all invoices
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });
    res.json(invoices); // returns array
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new invoice
router.post("/", async (req, res) => {
  try {
    console.log("Incoming body:", req.body); // 👈 add this

    const { clientName, amount, description, dueDate } = req.body;
    const newInvoice = new Invoice({ clientName, amount, description, dueDate });
    await newInvoice.save();

    res.status(201).json(newInvoice);
  } catch (err) {
    console.error("Error saving invoice:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
