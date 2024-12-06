const express = require('express');
const router = express.Router();
const tf = require('@tensorflow/tfjs-node');
const Transaction = require('../models/Transaction');

// Helper function to prepare data for training
const prepareData = (transactions) => {
  const dates = transactions.map((t) => new Date(t.date).getTime());
  const expenses = transactions.map((t) => t.amount);

  const minDate = Math.min(...dates);
  const normalizedDates = dates.map((d) => (d - minDate) / (1000 * 60 * 60 * 24));

  return { normalizedDates, expenses };
};

// Train the model
const trainModel = async (dates, expenses) => {
  const xs = tf.tensor2d(dates, [dates.length, 1]);
  const ys = tf.tensor2d(expenses, [expenses.length, 1]);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

  await model.fit(xs, ys, { epochs: 100 });

  return model;
};

// Predict future expenses
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: 'expense' });
    if (transactions.length < 2) {
      return res.status(400).json({ error: 'Not enough data for predictions.' });
    }

    const { normalizedDates, expenses } = prepareData(transactions);
    const model = await trainModel(normalizedDates, expenses);

    // Predict for the next 7 days
    const lastDate = Math.max(...normalizedDates);
    const futureDates = Array.from({ length: 7 }, (_, i) => lastDate + i + 1);
    const futureExpensesTensor = tf.tensor2d(futureDates, [futureDates.length, 1]);
    const predictions = model.predict(futureExpensesTensor).dataSync();

    const result = futureDates.map((d, i) => ({
      date: new Date(d * 1000 * 60 * 60 * 24 + Math.min(...transactions.map((t) => new Date(t.date).getTime()))).toISOString().split('T')[0],
      amount: Math.max(0, predictions[i]), // Avoid negative predictions
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
