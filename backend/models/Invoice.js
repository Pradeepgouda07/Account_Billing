const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  dueDate: { type: Date, default: Date.now },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
