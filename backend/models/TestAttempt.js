const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [String],  // This is an array of strings
  score: { type: Number, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  status: { type: String, default: 'Incomplete' }
});

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
module.exports = TestAttempt;
