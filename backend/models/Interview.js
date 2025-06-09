const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  interviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  available_time_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AvailableTime', required: false },  location: String,
  status: { type: String, enum: ['Chờ phê duyệt','Đang đợi phỏng vấn', 'Đã phỏng vấn', 'Hủy'], default: 'chưa phỏng vấn' },
  notes: String,
  created_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Interview', interviewSchema);
 