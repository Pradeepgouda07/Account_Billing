const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Expense = require("../models/Expense");

const getMonthlyReport = async (month, year, userId) => {
  // Define start and end dates for the month
  const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
  const endDate = new Date(year, month, 1); // First day of next month

  // Aggregate total invoices for the user in the month
  const totalInvoices = await Invoice.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        issueDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Aggregate total payments for the user in the month
  const totalPayments = await Payment.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Aggregate total expenses for the user in the month
  const totalExpenses = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Calculate totals
  const totalInvoicesSum =
    totalInvoices.length > 0 ? totalInvoices[0].total : 0;
  const invoicesCount =
    totalInvoices.length > 0 ? totalInvoices[0].count : 0;
  const totalPaymentsSum =
    totalPayments.length > 0 ? totalPayments[0].total : 0;
  const totalExpensesSum =
    totalExpenses.length > 0 ? totalExpenses[0].total : 0;
  
  // Net income: Total invoices (revenue) + Payments - Expenses
  const netIncome = totalInvoicesSum + totalPaymentsSum - totalExpensesSum;

  return {
    totalInvoices: totalInvoicesSum,
    invoicesCount: invoicesCount,
    totalPayments: totalPaymentsSum,
    totalExpenses: totalExpensesSum,
    netIncome: netIncome,
  };
};

router.get("/monthly", async (req, res) => {
  const { month, year } = req.query;
  const userId = req.user.id; // From verifyToken middleware

  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required" });
  }

  try {
    // Fetch report data from DB for the authenticated user
    const report = await getMonthlyReport(
      parseInt(month),
      parseInt(year),
      userId
    );
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;