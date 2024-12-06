const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add a new transaction
router.post('/', async (req, res) => {
  try {
    const { type, amount, category } = req.body;
    const transaction = new Transaction({ type, amount, category });
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
