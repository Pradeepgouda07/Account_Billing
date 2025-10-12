const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  amount: Number,
  date: { type: Date, default: Date.now },
  description: String,
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // or separate Supplier model
  ledgerEntry: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" }
});

module.exports = mongoose.model("Payment", PaymentSchema);
