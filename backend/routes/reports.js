const express = require("express");
const router = express.Router();

router.get("/monthly", async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required" });
  }

  try {
    // Fetch report data from DB
    const report = await getMonthlyReport(month, year); // example function
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
