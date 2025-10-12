const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Invoices route accessible by logged-in users" });
});

module.exports = router;
