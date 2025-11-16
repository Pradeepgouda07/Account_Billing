const router = require("express").Router();
const mongoose = require("mongoose");
const { verifyToken } = require("../middleware/auth");
const Expense = require("../models/Expense");
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

// GET /api/dashboard
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken middleware
    
    // Convert userId to ObjectId for MongoDB queries
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Total expenses
    const totalExpensesAgg = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = totalExpensesAgg[0]?.total || 0;

    // Total payments
    const totalPaymentsAgg = await Payment.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalPayments = totalPaymentsAgg[0]?.total || 0;

    // Count invoices issued
    const invoicesCount = await Invoice.countDocuments({ userId: userObjectId });

    // Total invoice amounts
    const totalInvoicesAgg = await Invoice.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalInvoices = totalInvoicesAgg[0]?.total || 0;

    // For reports generated, just an example count (adjust if needed)
    const reportsCount = 0;

    // Net balance (payments - expenses)
    const balance = totalPayments - totalExpenses;

    res.json({
      totalExpenses,
      totalPayments,
      invoicesCount,
      totalInvoices,
      reportsCount,
      balance
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;




