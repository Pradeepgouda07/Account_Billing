const mongoose = require("mongoose");

const InvoiceLineSchema = new mongoose.Schema({
  description: String,
  qty: Number,
  unitPrice: Number,
  totalPrice: Number,
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
});

module.exports = mongoose.model("InvoiceLine", InvoiceLineSchema);
