const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  goal: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Goal', GoalSchema);
