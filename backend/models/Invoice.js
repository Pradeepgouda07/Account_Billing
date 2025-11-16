const mongoose = require("mongoose");

// Item/Line Item Schema
const ItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }, // quantity * price
});

// Client Information Schema
const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { 
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: "India" }
  },
  taxId: { type: String }, // GST/VAT number
});

// Main Invoice Schema
const InvoiceSchema = new mongoose.Schema(
  {
    // Invoice Identification
    invoiceNumber: { 
      type: String, 
      required: true,
      unique: true,
      index: true
    },
    
    // Client Information
    client: { type: ClientSchema, required: true },
    
    // Line Items
    items: { 
      type: [ItemSchema], 
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: "Invoice must have at least one item"
      }
    },
    
    // Financial Calculations
    subtotal: { 
      type: Number, 
      required: true, 
      min: 0,
      default: 0
    },
    discount: { 
      type: Number, 
      default: 0, 
      min: 0
    },
    discountType: { 
      type: String, 
      enum: ["percentage", "fixed"], 
      default: "fixed" 
    },
    taxRate: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 100 
    }, // Tax percentage (e.g., 18 for 18% GST)
    tax: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    shipping: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    total: { 
      type: Number, 
      required: true, 
      min: 0,
      default: 0
    },
    
    // Dates
    issueDate: { 
      type: Date, 
      default: Date.now,
      required: true
    },
    dueDate: { 
      type: Date, 
      required: true 
    },
    paidDate: { 
      type: Date 
    },
    
    // Status and Payment
    status: { 
      type: String, 
      enum: ["draft", "sent", "viewed", "paid", "overdue", "cancelled", "refunded"],
      default: "draft",
      index: true
    },
    paymentStatus: { 
      type: String, 
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
      index: true
    },
    amountPaid: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    amountDue: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    
    // Payment Terms
    paymentTerms: { 
      type: String, 
      default: "Net 30" // e.g., "Net 30", "Due on Receipt", "Net 15"
    },
    currency: { 
      type: String, 
      default: "INR",
      uppercase: true
    },
    
    // Additional Information
    notes: { type: String },
    terms: { type: String }, // Terms and conditions
    reference: { type: String }, // PO Number, Reference Number, etc.
    
    // User Association
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Admin", 
      required: true,
      index: true
    },
    
    // Metadata
    sentAt: { type: Date }, // When invoice was sent to client
    viewedAt: { type: Date }, // When client viewed the invoice
    lastReminderSent: { type: Date }, // Last payment reminder sent
  },
  { 
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if invoice is overdue
InvoiceSchema.virtual("isOverdue").get(function() {
  if (this.status === "paid" || this.status === "cancelled") {
    return false;
  }
  return this.dueDate && new Date() > this.dueDate;
});

// Pre-save middleware to calculate totals and update status
InvoiceSchema.pre("save", function(next) {
  // Calculate subtotal from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      const itemTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
      item.total = itemTotal;
      return sum + itemTotal;
    }, 0);
  } else {
    // Ensure subtotal is set even if no items
    this.subtotal = this.subtotal || 0;
  }
  
  // Ensure subtotal is a valid number
  this.subtotal = Number(this.subtotal) || 0;
  
  // Apply discount
  let amountAfterDiscount = this.subtotal;
  const discountValue = Number(this.discount) || 0;
  if (discountValue > 0) {
    if (this.discountType === "percentage") {
      amountAfterDiscount = this.subtotal * (1 - discountValue / 100);
    } else {
      amountAfterDiscount = Math.max(0, this.subtotal - discountValue);
    }
  }
  
  // Calculate tax
  const taxRateValue = Number(this.taxRate) || 0;
  this.tax = amountAfterDiscount * (taxRateValue / 100);
  
  // Calculate total - ensure it's always a number
  const shippingValue = Number(this.shipping) || 0;
  this.total = amountAfterDiscount + this.tax + shippingValue;
  
  // Ensure total is never NaN or undefined
  if (isNaN(this.total) || this.total === undefined || this.total === null) {
    this.total = 0;
  }
  
  // Update amount due
  const amountPaidValue = Number(this.amountPaid) || 0;
  this.amountDue = Math.max(0, this.total - amountPaidValue);
  
  // Update payment status
  if (amountPaidValue === 0) {
    this.paymentStatus = "unpaid";
  } else if (amountPaidValue >= this.total) {
    this.paymentStatus = "paid";
    if (!this.paidDate) {
      this.paidDate = new Date();
    }
    if (this.status === "sent" || this.status === "viewed" || this.status === "overdue") {
      this.status = "paid";
    }
  } else {
    this.paymentStatus = "partial";
  }
  
  // Update overdue status
  if (this.paymentStatus !== "paid" && this.dueDate && new Date() > this.dueDate) {
    if (this.status !== "cancelled" && this.status !== "refunded") {
      this.status = "overdue";
    }
  }
  
  next();
});

// Method to generate invoice number (can be called before saving)
InvoiceSchema.statics.generateInvoiceNumber = async function(userId) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  // Find the latest invoice for this user in the current year
  const latestInvoice = await this.findOne({
    userId: userId,
    invoiceNumber: { $regex: `^${prefix}` }
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (latestInvoice && latestInvoice.invoiceNumber) {
    const lastSeq = parseInt(latestInvoice.invoiceNumber.split("-").pop());
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }
  
  return `${prefix}${sequence.toString().padStart(4, "0")}`;
};

// Index for efficient queries
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ userId: 1, issueDate: -1 });
InvoiceSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model("Invoice", InvoiceSchema);
