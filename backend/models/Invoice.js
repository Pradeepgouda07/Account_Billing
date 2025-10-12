const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  totalAmount: Number,
  status: {
    type: String,
    enum: ["draft", "sent", "paid", "overdue"],
    default: "draft"
  },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
