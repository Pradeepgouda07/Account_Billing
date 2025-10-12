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

const { verifyToken, requireRole } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("Mongo error:", err);
    process.exit(1); // stop app if DB connection fails
  });

// Public/auth routes
app.use("/api/auth", authRoutes);

// Protected routes for logged-in users
app.use("/api/expenses", verifyToken, expenseRoutes);
app.use("/api/payments", verifyToken, paymentRoutes);
app.use("/api/invoices", verifyToken, invoiceRoutes);

// Admin-only routes
app.use("/api/admin", verifyToken, requireRole("admin"), adminRoutes);
app.use("/api/reports", verifyToken, requireRole("admin"), reportRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
