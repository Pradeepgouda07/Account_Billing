// const router = require("express").Router();
// const Ledger = require("../models/Ledger");
// const { verifyToken } = require("../middleware/auth");

// // GET all ledger entries for logged-in user
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const entries = await Ledger.find({ user: userId }).sort({ date: 1 });
//     res.json(entries);
//   } catch (err) {
//     console.error("Ledger fetch error:", err);
//     res.status(500).json({ message: "Failed to fetch ledger entries" });
//   }
// });

// // POST a new ledger entry
// router.post("/", verifyToken, async (req, res) => {
//   try {
//     const { date, description, debit = 0, credit = 0 } = req.body;
//     const userId = req.user.id;

//     // Compute new balance (optional: you can sum all previous entries)
//     const lastEntry = await Ledger.findOne({ user: userId }).sort({ date: -1 });
//     const previousBalance = lastEntry?.balance || 0;
//     const newBalance = previousBalance - debit + credit;

//     const entry = new Ledger({
//       user: userId,
//       date,
//       description,
//       debit,
//       credit,
//       balance: newBalance
//     });

//     await entry.save();
//     res.status(201).json(entry);
//   } catch (err) {
//     console.error("Ledger save error:", err);
//     res.status(500).json({ message: "Failed to add ledger entry" });
//   }
// });

// module.exports = router;




const router = require("express").Router();
const Ledger = require("../models/Ledger");
const { verifyToken } = require("../middleware/auth");

// GET all ledger entries for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const entries = await Ledger.find({ user: userId }).sort({ date: 1 });
    res.json(entries);
  } catch (err) {
    console.error("Ledger fetch error:", err);
    res.status(500).json({ message: "Failed to fetch ledger entries" });
  }
});

// POST a new ledger entry
router.post("/", verifyToken, async (req, res) => {
  try {
    const { date, description, debit = 0, credit = 0 } = req.body;
    const userId = req.user.id;

    // Compute new balance by recalculating all entries
    const allEntries = await Ledger.find({ user: userId }).sort({ date: 1 });
    let runningBalance = 0;
    for (const entry of allEntries) {
      runningBalance = runningBalance - entry.debit + entry.credit;
      entry.balance = runningBalance;
      await entry.save();
    }

    const newBalance = runningBalance - debit + credit;

    const entry = new Ledger({
      user: userId,
      date,
      description,
      debit,
      credit,
      balance: newBalance,
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error("Ledger save error:", err);
    res.status(500).json({ message: "Failed to add ledger entry" });
  }
});

// DELETE a ledger entry
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const entry = await Ledger.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    res.json({ message: "Entry deleted" });
  } catch (err) {
    console.error("Ledger delete error:", err);
    res.status(500).json({ message: "Failed to delete entry" });
  }
});

module.exports = router;


