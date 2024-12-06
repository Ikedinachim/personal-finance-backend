const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// Get the current goal
router.get('/', async (req, res) => {
  try {
    const goal = await Goal.findOne().sort({ createdAt: -1 });
    res.json(goal);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Set a new goal
router.post('/', async (req, res) => {
  try {
    const { goal } = req.body;
    const newGoal = new Goal({ goal });
    await newGoal.save();
    res.json(newGoal);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
