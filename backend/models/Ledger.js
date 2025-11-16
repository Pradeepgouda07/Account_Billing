


const mongoose = require("mongoose");

const LedgerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  debit: { type: Number, default: 0 },   // money out
  credit: { type: Number, default: 0 },  // money in
  balance: { type: Number, default: 0 }  // running balance
});

module.exports = mongoose.model("Ledger", LedgerSchema);
