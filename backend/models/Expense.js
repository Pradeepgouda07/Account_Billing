const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  category: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  description: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  ledgerEntry: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" }
});

module.exports = mongoose.model("Expense", ExpenseSchema);
