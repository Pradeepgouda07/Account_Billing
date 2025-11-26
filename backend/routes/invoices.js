// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();
// const { verifyToken } = require("../middleware/auth");
// const Invoice = require("../models/Invoice");

// // GET all invoices for logged-in user
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const userId = new mongoose.Types.ObjectId(req.user.id);
//     const { status, paymentStatus } = req.query;
    
//     // Build query
//     const query = { userId };
//     if (status) query.status = status;
//     if (paymentStatus) query.paymentStatus = paymentStatus;
    
//     const invoices = await Invoice.find(query)
//       .sort({ issueDate: -1 })
//       .select("-__v");
    
//     res.json(invoices);
//   } catch (err) {
//     console.error("Error fetching invoices:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // GET single invoice by ID
// router.get("/:id", verifyToken, async (req, res) => {
//   try {
//     const invoiceId = req.params.id;
//     const userId = new mongoose.Types.ObjectId(req.user.id);

//     if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
//       return res.status(400).json({ error: "Invalid invoice ID format" });
//     }

//     const invoice = await Invoice.findOne({
//       _id: new mongoose.Types.ObjectId(invoiceId),
//       userId: userId,
//     }).select("-__v");

//     if (!invoice) {
//       return res.status(404).json({ error: "Invoice not found or not authorized" });
//     }

//     res.json(invoice);
//   } catch (err) {
//     console.error("Error fetching invoice:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // POST create a new invoice
// router.post("/", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     // Debug: Log incoming request
//     console.log("Invoice POST request body:", JSON.stringify(req.body, null, 2));
    
//     const {
//       client,
//       items,
//       discount,
//       discountType,
//       taxRate,
//       shipping,
//       dueDate,
//       issueDate,
//       paymentTerms,
//       currency,
//       notes,
//       terms,
//       reference,
//       status,
//     } = req.body;

//     // Validate required fields
//     if (!client) {
//       return res.status(400).json({ error: "Client information is required" });
//     }
    
//     if (!client.name || typeof client.name !== "string" || client.name.trim() === "") {
//       return res.status(400).json({ error: "Client name is required" });
//     }

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ error: "At least one item is required" });
//     }

//     // Validate items
//     for (const item of items) {
//       if (!item.description || item.quantity === undefined || item.price === undefined) {
//         return res.status(400).json({ 
//           error: "Each item must have description, quantity, and price" 
//         });
//       }
//       if (item.quantity < 0 || item.price < 0) {
//         return res.status(400).json({ 
//           error: "Item quantity and price must be non-negative" 
//         });
//       }
//     }

//     // Generate invoice number
//     const invoiceNumber = await Invoice.generateInvoiceNumber(userId);

//     // Calculate due date (default to 30 days from issue date)
//     let calculatedDueDate = dueDate;
//     if (!calculatedDueDate) {
//       const issue = issueDate ? new Date(issueDate) : new Date();
//       calculatedDueDate = new Date(issue);
//       calculatedDueDate.setDate(calculatedDueDate.getDate() + 30);
//     }

//     // Calculate initial totals (pre-save middleware will recalculate, but we need initial values)
//     const mappedItems = items.map(item => ({
//       description: item.description,
//       quantity: Number(item.quantity),
//       price: Number(item.price),
//       total: Number(item.quantity) * Number(item.price),
//     }));
    
//     const initialSubtotal = mappedItems.reduce((sum, item) => sum + item.total, 0);
//     let amountAfterDiscount = initialSubtotal;
//     const discountValue = discount ? Number(discount) : 0;
//     const discountTypeValue = discountType || "fixed";
    
//     if (discountValue > 0) {
//       if (discountTypeValue === "percentage") {
//         amountAfterDiscount = initialSubtotal * (1 - discountValue / 100);
//       } else {
//         amountAfterDiscount = Math.max(0, initialSubtotal - discountValue);
//       }
//     }
    
//     const taxRateValue = taxRate ? Number(taxRate) : 0;
//     const tax = amountAfterDiscount * (taxRateValue / 100);
//     const shippingValue = shipping ? Number(shipping) : 0;
//     const initialTotal = amountAfterDiscount + tax + shippingValue;

//     // Ensure total is always a valid number
//     const finalTotal = isNaN(initialTotal) || initialTotal === undefined || initialTotal === null ? 0 : Number(initialTotal);

//     // Create new invoice
//     const newInvoice = new Invoice({
//       invoiceNumber,
//       client: {
//         name: client.name,
//         email: client.email || "",
//         phone: client.phone || "",
//         address: client.address || {},
//         taxId: client.taxId || "",
//       },
//       items: mappedItems,
//       subtotal: initialSubtotal || 0,
//       discount: discountValue,
//       discountType: discountTypeValue,
//       taxRate: taxRateValue,
//       tax: tax || 0,
//       shipping: shippingValue,
//       total: finalTotal,
//       dueDate: new Date(calculatedDueDate),
//       issueDate: issueDate ? new Date(issueDate) : new Date(),
//       paymentTerms: paymentTerms || "Net 30",
//       currency: currency || "INR",
//       notes: notes || "",
//       terms: terms || "",
//       reference: reference || "",
//       status: status || "draft",
//       userId: new mongoose.Types.ObjectId(userId),
//     });

//     // Save invoice (pre-save middleware will calculate totals)
//     await newInvoice.save();

//     res.status(201).json(newInvoice);
//   } catch (err) {
//     console.error("Error creating invoice:", err);
//     if (err.code === 11000) {
//       return res.status(400).json({ error: "Invoice number already exists" });
//     }
//     // Handle Mongoose validation errors
//     if (err.name === "ValidationError") {
//       const errors = Object.values(err.errors).map(e => e.message).join(", ");
//       return res.status(400).json({ error: `Validation error: ${errors}` });
//     }
//     res.status(500).json({ error: err.message || "Server error" });
//   }
// });

// // PUT update an invoice
// router.put("/:id", verifyToken, async (req, res) => {
//   try {
//     const invoiceId = req.params.id;
//     const userId = new mongoose.Types.ObjectId(req.user.id);
//     const updateData = req.body;

//     if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
//       return res.status(400).json({ error: "Invalid invoice ID format" });
//     }

//     // Find invoice
//     const invoice = await Invoice.findOne({
//       _id: new mongoose.Types.ObjectId(invoiceId),
//       userId: userId,
//     });

//     if (!invoice) {
//       return res.status(404).json({ error: "Invoice not found or not authorized" });
//     }

//     // Prevent updating certain fields
//     delete updateData._id;
//     delete updateData.userId;
//     delete updateData.invoiceNumber;
//     delete updateData.createdAt;
//     delete updateData.updatedAt;

//     // Update fields
//     if (updateData.client) {
//       invoice.client = { ...invoice.client, ...updateData.client };
//       delete updateData.client;
//     }

//     if (updateData.items) {
//       // Validate items
//       if (!Array.isArray(updateData.items) || updateData.items.length === 0) {
//         return res.status(400).json({ error: "At least one item is required" });
//       }
//       invoice.items = updateData.items.map(item => ({
//         description: item.description,
//         quantity: Number(item.quantity),
//         price: Number(item.price),
//         total: Number(item.quantity) * Number(item.price),
//       }));
//       delete updateData.items;
//     }

//     // Update other fields
//     Object.keys(updateData).forEach(key => {
//       if (updateData[key] !== undefined) {
//         invoice[key] = updateData[key];
//       }
//     });

//     // Convert dates
//     if (updateData.dueDate) invoice.dueDate = new Date(updateData.dueDate);
//     if (updateData.issueDate) invoice.issueDate = new Date(updateData.issueDate);

//     // Save (pre-save middleware will recalculate totals)
//     await invoice.save();

//     res.json(invoice);
//   } catch (err) {
//     console.error("Error updating invoice:", err);
//     res.status(500).json({ error: err.message || "Server error" });
//   }
// });

// // PATCH update invoice payment status
// router.patch("/:id/payment", verifyToken, async (req, res) => {
//   try {
//     const invoiceId = req.params.id;
//     const userId = new mongoose.Types.ObjectId(req.user.id);
//     const { amountPaid } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
//       return res.status(400).json({ error: "Invalid invoice ID format" });
//     }

//     if (amountPaid === undefined || amountPaid < 0) {
//       return res.status(400).json({ error: "Valid amountPaid is required" });
//     }

//     const invoice = await Invoice.findOne({
//       _id: new mongoose.Types.ObjectId(invoiceId),
//       userId: userId,
//     });

//     if (!invoice) {
//       return res.status(404).json({ error: "Invoice not found or not authorized" });
//     }

//     invoice.amountPaid = Number(amountPaid);
    
//     // If fully paid, set paidDate
//     if (invoice.amountPaid >= invoice.total && !invoice.paidDate) {
//       invoice.paidDate = new Date();
//     }

//     await invoice.save();

//     res.json(invoice);
//   } catch (err) {
//     console.error("Error updating payment:", err);
//     res.status(500).json({ error: err.message || "Server error" });
//   }
// });

// // PATCH update invoice status
// router.patch("/:id/status", verifyToken, async (req, res) => {
//   try {
//     const invoiceId = req.params.id;
//     const userId = new mongoose.Types.ObjectId(req.user.id);
//     const { status } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
//       return res.status(400).json({ error: "Invalid invoice ID format" });
//     }

//     const validStatuses = ["draft", "sent", "viewed", "paid", "overdue", "cancelled", "refunded"];
//     if (!status || !validStatuses.includes(status)) {
//       return res.status(400).json({ error: "Valid status is required" });
//     }

//     const invoice = await Invoice.findOne({
//       _id: new mongoose.Types.ObjectId(invoiceId),
//       userId: userId,
//     });

//     if (!invoice) {
//       return res.status(404).json({ error: "Invoice not found or not authorized" });
//     }

//     invoice.status = status;
    
//     // Update metadata based on status
//     if (status === "sent" && !invoice.sentAt) {
//       invoice.sentAt = new Date();
//     }
//     if (status === "viewed" && !invoice.viewedAt) {
//       invoice.viewedAt = new Date();
//     }

//     await invoice.save();

//     res.json(invoice);
//   } catch (err) {
//     console.error("Error updating status:", err);
//     res.status(500).json({ error: err.message || "Server error" });
//   }
// });

// // DELETE invoice
// router.delete("/:id", verifyToken, async (req, res) => {
//   try {
//     const invoiceId = req.params.id;
//     const userId = new mongoose.Types.ObjectId(req.user.id);

//     if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
//       return res.status(400).json({ error: "Invalid invoice ID format" });
//     }

//     const deleted = await Invoice.findOneAndDelete({
//       _id: new mongoose.Types.ObjectId(invoiceId),
//       userId: userId,
//     });

//     if (!deleted) {
//       return res.status(404).json({ error: "Invoice not found or not authorized" });
//     }

//     res.json({ message: "Invoice deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting invoice:", err);
//     res.status(500).json({ error: err.message || "Server error" });
//   }
// });

// module.exports = router;


// correct working 
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const Invoice = require("../models/Invoice");

// GET all invoices for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { status, paymentStatus } = req.query;
    
    // Build query
    const query = { userId };
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const invoices = await Invoice.find(query)
      .sort({ issueDate: -1 })
      .select("-__v");
    
    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single invoice by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ error: "Invalid invoice ID format" });
    }

    const invoice = await Invoice.findOne({
      _id: new mongoose.Types.ObjectId(invoiceId),
      userId: userId,
    }).select("-__v");

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found or not authorized" });
    }

    res.json(invoice);
  } catch (err) {
    console.error("Error fetching invoice:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new invoice
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Debug: Log incoming request
    console.log("Invoice POST request body:", JSON.stringify(req.body, null, 2));
    
    const {
      client,
      items,
      discount,
      discountType,
      taxRate,
      shipping,
      dueDate,
      issueDate,
      paymentTerms,
      currency,
      notes,
      terms,
      reference,
      status,
    } = req.body;

    // Validate required fields
    if (!client) {
      return res.status(400).json({ error: "Client information is required" });
    }
    
    if (!client.name || typeof client.name !== "string" || client.name.trim() === "") {
      return res.status(400).json({ error: "Client name is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" });
    }

    // Validate items
    for (const item of items) {
      if (!item.description || item.quantity === undefined || item.price === undefined) {
        return res.status(400).json({ 
          error: "Each item must have description, quantity, and price" 
        });
      }
      if (item.quantity < 0 || item.price < 0) {
        return res.status(400).json({ 
          error: "Item quantity and price must be non-negative" 
        });
      }
    }

    // Generate invoice number
    const invoiceNumber = await Invoice.generateInvoiceNumber(userId);

    // Calculate due date (default to 30 days from issue date)
    let calculatedDueDate = dueDate;
    if (!calculatedDueDate) {
      const issue = issueDate ? new Date(issueDate) : new Date();
      calculatedDueDate = new Date(issue);
      calculatedDueDate.setDate(calculatedDueDate.getDate() + 30);
    }

    // Calculate initial totals (pre-save middleware will recalculate, but we need initial values)
    const mappedItems = items.map(item => ({
      description: item.description,
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.quantity) * Number(item.price),
    }));
    
    const initialSubtotal = mappedItems.reduce((sum, item) => sum + item.total, 0);
    let amountAfterDiscount = initialSubtotal;
    const discountValue = discount ? Number(discount) : 0;
    const discountTypeValue = discountType || "fixed";
    
    if (discountValue > 0) {
      if (discountTypeValue === "percentage") {
        amountAfterDiscount = initialSubtotal * (1 - discountValue / 100);
      } else {
        amountAfterDiscount = Math.max(0, initialSubtotal - discountValue);
      }
    }
    
    const taxRateValue = taxRate ? Number(taxRate) : 0;
    const tax = amountAfterDiscount * (taxRateValue / 100);
    const shippingValue = shipping ? Number(shipping) : 0;
    const initialTotal = amountAfterDiscount + tax + shippingValue;

    // Ensure total is always a valid number
    const finalTotal = isNaN(initialTotal) || initialTotal === undefined || initialTotal === null ? 0 : Number(initialTotal);

    // Create new invoice
    const newInvoice = new Invoice({
      invoiceNumber,
      client: {
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || {},
        taxId: client.taxId || "",
      },
      items: mappedItems,
      subtotal: initialSubtotal || 0,
      discount: discountValue,
      discountType: discountTypeValue,
      taxRate: taxRateValue,
      tax: tax || 0,
      shipping: shippingValue,
      total: finalTotal,
      dueDate: new Date(calculatedDueDate),
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      paymentTerms: paymentTerms || "Net 30",
      currency: currency || "INR",
      notes: notes || "",
      terms: terms || "",
      reference: reference || "",
      status: status || "draft",
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Save invoice (pre-save middleware will calculate totals)
    await newInvoice.save();

    res.status(201).json(newInvoice);
  } catch (err) {
    console.error("Error creating invoice:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Invoice number already exists" });
    }
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ error: `Validation error: ${errors}` });
    }
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// PUT update an invoice
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ error: "Invalid invoice ID format" });
    }

    // Find invoice
    const invoice = await Invoice.findOne({
      _id: new mongoose.Types.ObjectId(invoiceId),
      userId: userId,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found or not authorized" });
    }

    // Prevent updating certain fields
    delete updateData._id;
    delete updateData.userId;
    delete updateData.invoiceNumber;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Update fields
    if (updateData.client) {
      invoice.client = { ...invoice.client, ...updateData.client };
      delete updateData.client;
    }

    if (updateData.items) {
      // Validate items
      if (!Array.isArray(updateData.items) || updateData.items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
      }
      invoice.items = updateData.items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.quantity) * Number(item.price),
      }));
      delete updateData.items;
    }

    // Update other fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        invoice[key] = updateData[key];
      }
    });

    // Convert dates
    if (updateData.dueDate) invoice.dueDate = new Date(updateData.dueDate);
    if (updateData.issueDate) invoice.issueDate = new Date(updateData.issueDate);

    // Save (pre-save middleware will recalculate totals)
    await invoice.save();

    res.json(invoice);
  } catch (err) {
    console.error("Error updating invoice:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// PATCH update invoice payment status
router.patch("/:id/payment", verifyToken, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { amountPaid } = req.body;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ error: "Invalid invoice ID format" });
    }

    if (amountPaid === undefined || amountPaid < 0) {
      return res.status(400).json({ error: "Valid amountPaid is required" });
    }

    const invoice = await Invoice.findOne({
      _id: new mongoose.Types.ObjectId(invoiceId),
      userId: userId,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found or not authorized" });
    }

    invoice.amountPaid = Number(amountPaid);
    
    // If fully paid, set paidDate
    if (invoice.amountPaid >= invoice.total && !invoice.paidDate) {
      invoice.paidDate = new Date();
    }

    await invoice.save();

    res.json(invoice);
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// PATCH update invoice status
router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ error: "Invalid invoice ID format" });
    }

    const validStatuses = ["draft", "sent", "viewed", "paid", "overdue", "cancelled", "refunded"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const invoice = await Invoice.findOne({
      _id: new mongoose.Types.ObjectId(invoiceId),
      userId: userId,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found or not authorized" });
    }

    invoice.status = status;
    
    // Update metadata based on status
    if (status === "sent" && !invoice.sentAt) {
      invoice.sentAt = new Date();
    }
    if (status === "viewed" && !invoice.viewedAt) {
      invoice.viewedAt = new Date();
    }

    await invoice.save();

    res.json(invoice);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// DELETE invoice
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ error: "Invalid invoice ID format" });
    }

    const deleted = await Invoice.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(invoiceId),
      userId: userId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Invoice not found or not authorized" });
    }

    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;

