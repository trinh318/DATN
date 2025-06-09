const mongoose = require('mongoose');

const interviewScheduleSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // Công việc liên quan
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ứng viên
  interviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người phỏng vấn
  start_time: { type: Date, required: true }, // Thời gian phỏng vấn
  location: { type: String, required: false }, // Địa điểm phỏng vấn 
  status: {
    type: String, 
    enum: ['available', 'cancle', 'Chờ phê duyệt', 'Đang đợi phỏng vấn', 'Đã phỏng vấn', 'Hủy'],
    //available: tạo thời gian khả dụng, thời gian được chọn sẽ set là 'Chờ phê duyệt',
    // nhà tuyển dụng xác nhận oke thời gian đó rồi thì thông báo địa điểm và set thành Đợi phỏng vấn
    // thời gian khả dụng nào không được chọn thì set 'cancle', còn hủy là hủy cuộc phỏng vấn
    default: 'available',
  }, // Trạng thái phỏng vấn
  notes: { type: String, required: false }, // Ghi chú thêm
  created_at: { type: Date, default: Date.now }, // Ngày tạo
  updated_at: { type: Date, default: Date.now }, // Ngày cập nhật
});

// Middleware to update `updated_at` before saving
interviewScheduleSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('InterviewSchedule', interviewScheduleSchema);
