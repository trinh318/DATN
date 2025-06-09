const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Nhà tuyển dụng
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },  // Công ty tuyển dụng
  title: { type: String, required: true },  // Tiêu đề công việc
  description: { type: String },  // Mô tả công việc
  requirements: { type: String },  // Yêu cầu công việc
  skills: { type: [String], required: true },  // Kỹ năng cần thiết cho công việc
  qualifications: { type: [String], required: true },  // Bằng cấp yêu cầu
  salary: { type: String },  // Mức lương
  job_type: { type: String, enum: ['full_time', 'part_time', 'internship', 'freelance'], required: true },  // Loại công việc
  vacancy: { type: Number },  // Số lượng tuyển dụng
  location: { type: String },  // Địa điểm công việc
  interview_location: { type: String },  // Vị trí phỏng vấn
  note: { type: String },  // Ghi chú thêm
  status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },  // Trạng thái công việc (mở, đóng, chờ xử lý)
  application_deadline: { type: Date },  // Hạn nộp đơn
  benefits: { type: [String], required: true },  // Các quyền lợi công việc
  field: { type: String }, 
  careers: { type: [String], required: true },
  highlighted: { type: Boolean, default: false },
  highlighted_until: { type: Date, default: null },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: false },
  created_at: { type: Date, default: Date.now },  // Thời gian tạo công việc
  updated_at: { type: Date, default: Date.now },  // Thời gian cập nhật công việc
  feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }], // Danh sách phản hồi từ người ứng tuyển
  moderation: { type: mongoose.Schema.Types.ObjectId, ref: 'Moderation' }, // lien ket kiem duyet noi dung 
});
 
// Cập nhật trường updated_at khi lưu công việc
jobSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = Date.now();
  }
  next();
});

// Xóa feedbacks khi công việc bị xóa
jobSchema.pre('remove', async function(next) {
  await Feedback.deleteMany({ job_id: this._id });
  next();
});

module.exports = mongoose.model('Job', jobSchema);
