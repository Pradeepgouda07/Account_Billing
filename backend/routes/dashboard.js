// const router = require("express").Router();
// const mongoose = require("mongoose");
// const { verifyToken } = require("../middleware/auth");
// const Expense = require("../models/Expense");
// const Payment = require("../models/Payment");
// const Invoice = require("../models/Invoice");

// // GET /api/dashboard
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.id; // from verifyToken middleware
    
//     // Convert userId to ObjectId for MongoDB queries
//     const userObjectId = new mongoose.Types.ObjectId(userId);

//     // Total expenses
//     const totalExpensesAgg = await Expense.aggregate([
//       { $match: { userId: userObjectId } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);
//     const totalExpenses = totalExpensesAgg[0]?.total || 0;

//     // Total payments
//     const totalPaymentsAgg = await Payment.aggregate([
//       { $match: { userId: userObjectId } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);
//     const totalPayments = totalPaymentsAgg[0]?.total || 0;

//     // Count invoices issued
//     const invoicesCount = await Invoice.countDocuments({ userId: userObjectId });

//     // Total invoice amounts
//     const totalInvoicesAgg = await Invoice.aggregate([
//       { $match: { userId: userObjectId } },
//       { $group: { _id: null, total: { $sum: "$total" } } }
//     ]);
//     const totalInvoices = totalInvoicesAgg[0]?.total || 0;

//     // For reports generated, just an example count (adjust if needed)
//     const reportsCount = 0;

//     // Net balance (payments - expenses)
//     const balance = totalPayments - totalExpenses;

//     res.json({
//       totalExpenses,
//       totalPayments,
//       invoicesCount,
//       totalInvoices,
//       reportsCount,
//       balance
//     });
//   } catch (err) {
//     console.error("Dashboard fetch error:", err);
//     res.status(500).json({ message: "Failed to fetch dashboard stats" });
//   }
// });



// // ADMIN SUMMARY
// router.get("/admin-summary", verifyToken, requireRole("admin"), async (req, res) => {

//   const totalUsers = await User.countDocuments();

//   const expenses = await Expense.aggregate([
//     { $group: { _id: null, total: { $sum: "$amount" } } }
//   ]);

//   const payments = await Payment.aggregate([
//     { $group: { _id: null, total: { $sum: "$amount" } } }
//   ]);

//   const totalExpenses = expenses[0]?.total || 0;
//   const totalPayments = payments[0]?.total || 0;

//   res.json({
//     totalUsers,
//     totalExpenses,
//     totalPayments,
//     netProfit: totalPayments - totalExpenses
//   });
// });

// module.exports = router;



// const router = require("express").Router();
// const mongoose = require("mongoose");
// const { verifyToken, requireRole } = require("../middleware/auth");

// const Expense = require("../models/Expense");
// const Payment = require("../models/Payment");
// const Invoice = require("../models/Invoice");
// const User = require("../models/User");

// /* ------------------------------------------------------------------
//    USER DASHBOARD SUMMARY  ( /api/dashboard )
// ------------------------------------------------------------------ */
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     if (req.user.role === "admin") return res.redirect("/api/dashboard/admin-summary");

//     const userId = new mongoose.Types.ObjectId(req.user.id);

//     const totalExpenses = await Expense.aggregate([
//       { $match: { userId } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]).then(a => a[0]?.total || 0);

//     const totalPayments = await Payment.aggregate([
//       { $match: { userId } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]).then(a => a[0]?.total || 0);

//     const invoicesCount = await Invoice.countDocuments({ userId });

//     const totalInvoices = await Invoice.aggregate([
//       { $match: { userId } },
//       { $group: { _id: null, total: { $sum: "$total" } } }
//     ]).then(a => a[0]?.total || 0);

//     res.json({
//       totalExpenses,
//       totalPayments,
//       invoicesCount,
//       totalInvoices,
//       reportsCount: 0,
//       balance: totalPayments - totalExpenses
//     });

//   } catch (err) {
//     console.error("Dashboard fetch error:", err);
//     res.status(500).json({ message: "Failed to fetch dashboard stats" });
//   }
// });

// /* ------------------------------------------------------------------
//    ADMIN SUMMARY  ( /api/dashboard/admin-summary )
// ------------------------------------------------------------------ */
// router.get("/admin-summary", verifyToken, requireRole("admin"), async (req, res) => {
//   try {
   

//     const totalExpenses = await Expense.aggregate([
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]).then(a => a[0]?.total || 0);

//     const totalPayments = await Payment.aggregate([
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]).then(a => a[0]?.total || 0);

//     res.json({
//       totalUsers,
//       totalExpenses,
//       totalPayments,
//       netProfit: totalPayments - totalExpenses
//     });

//   } catch (err) {
//     console.error("Admin summary error:", err);
//     res.status(500).json({ message: "Failed to fetch admin stats" });
//   }
// });
  
//     const netProfit = totalPayments - totalExpenses;
// const status = netProfit >= 0 ? "Profit" : "Loss";

// res.json({
//   totalUsers,
//   totalExpenses,
//   totalPayments,
//   netProfit,
//   status
// });


// module.exports = router;







const router = require("express").Router();
const mongoose = require("mongoose");
const { verifyToken, requireRole } = require("../middleware/auth");

const Expense = require("../models/Expense");
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const User = require("../models/User");

/* -------------------------------------------------------------
   USER DASHBOARD SUMMARY  ( /api/dashboard )
------------------------------------------------------------- */
router.get("/", verifyToken, async (req, res) => {
  try {
    // If admin → redirect to admin summary endpoint
    if (req.user.role === "admin") {
      return res.redirect("/api/dashboard/admin-summary");
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const totalExpenses = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).then(r => r[0]?.total || 0);

    const totalPayments = await Payment.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).then(r => r[0]?.total || 0);

    const invoicesCount = await Invoice.countDocuments({ userId });

    res.json({
      totalExpenses,
      totalPayments,
      invoicesCount,
      reportsCount: 0,
      balance: totalPayments - totalExpenses
    });

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

/* -------------------------------------------------------------
   ADMIN SUMMARY  ( /api/dashboard/admin-summary )
------------------------------------------------------------- */
router.get("/admin-summary", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).then(r => r[0]?.total || 0);

    const totalPayments = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).then(r => r[0]?.total || 0);

    const netProfit = totalPayments - totalExpenses;
    const status = netProfit >= 0 ? "Profit" : "Loss";

    res.json({
      totalUsers,
      totalExpenses,
      totalPayments,
      netProfit,
      status
    });

  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

module.exports = router;
