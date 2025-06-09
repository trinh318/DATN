const mongoose = require('mongoose');

const testAnswerSchema = new mongoose.Schema({
  test_attempt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TestAttempt', required: true },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TestQuestion', required: true },
  answer: { type: String, required: true },
  is_correct: { type: Boolean, required: true },
  points_awarded: { type: Number, default: 0 }
}, {
  timestamps: true // Tự động thêm created_at và updated_at
});

module.exports = mongoose.model('TestAnswer', testAnswerSchema);
