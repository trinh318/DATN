const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  test_attempt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TestAttempt', required: true },
  total_score: { type: Number, required: true },
  correct_answers: { type: Number, required: true },
  incorrect_answers: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestResult', testResultSchema);
