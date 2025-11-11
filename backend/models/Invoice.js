const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  dueDate: { type: Date },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
