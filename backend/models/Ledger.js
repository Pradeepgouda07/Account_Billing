const mongoose = require("mongoose");

const LedgerSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  description: String,
  debitAccount: String,
  creditAccount: String,
  amount: Number,
  referenceType: String,
  referenceId: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model("Ledger", LedgerSchema);
