const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },  // Công việc mà người dùng đang phản hồi
  from_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Người đưa ra phản hồi
  to_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Người nhận phản hồi
  rating: { type: Number, min: 1, max: 5, required: true },  // Đánh giá từ 1 đến 5
  comment: { type: String, required: true },  // Bình luận về công việc hoặc ứng viên
  created_at: { type: Date, default: Date.now },  // Thời gian tạo phản hồi
});

module.exports = mongoose.model('Feedback', feedbackSchema);
