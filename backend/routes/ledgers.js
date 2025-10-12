const express = require('express');
const { Ledger } = require('../models');
const { authMiddleware, permit } = require('../utils/auth');
const router = express.Router();

// list all ledger entries (admin/accountant)
router.get('/', authMiddleware, permit('admin', 'accountant'), async (req, res) => {
  const entries = await Ledger.findAll();
  res.json(entries);
});

// create entry
router.post('/', authMiddleware, permit('accountant', 'admin'), async (req, res) => {
  const { date, description, debitAccount, creditAccount, amount, referenceType, referenceId } = req.body;
  const entry = await Ledger.create({ date, description, debitAccount, creditAccount, amount, referenceType, referenceId });
  res.json(entry);
});

module.exports = router;
