const mongoose = require('mongoose');

const testQuestionSchema = new mongoose.Schema({
  test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true }, // Liên kết với bảng tests
  question: { type: String, required: true }, // Câu hỏi
  options: { 
    type: [String], // Mảng chứa các lựa chọn câu hỏi
    required: true
  },
  correct_answer: { 
    type: String, 
    required: true 
  }, // Đáp án đúng
  points: { 
    type: Number, 
    required: true 
  }, // Số điểm cho câu hỏi
  created_at: { type: Date, default: Date.now }, // Thời gian tạo câu hỏi
});

module.exports = mongoose.model('TestQuestion', testQuestionSchema);
