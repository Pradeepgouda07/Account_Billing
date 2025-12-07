
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const expenseRoutes = require("./routes/expenses");
const invoiceRoutes = require("./routes/invoices");
const paymentRoutes = require("./routes/payments");
const reportRoutes = require("./routes/reports");
const ledgerRoutes = require("./routes/ledgers");
const dashboardRoutes = require("./routes/dashboard");

const { verifyToken, requireRole } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Public
app.use("/api/auth", authRoutes);

// PROTECTED ROUTES
app.use("/api/expenses", verifyToken, expenseRoutes);
app.use("/api/payments", verifyToken, paymentRoutes);
app.use("/api/invoices", verifyToken, invoiceRoutes);
app.use("/api/ledger", verifyToken, ledgerRoutes);
app.use("/api/reports", verifyToken, reportRoutes);

// DASHBOARD (IMPORTANT!!)
app.use("/api/dashboard", verifyToken, dashboardRoutes);

// ADMIN
app.use("/api/admin", verifyToken, requireRole("admin"), adminRoutes);

app.listen(4000, () => console.log("Server running on port 4000"));
