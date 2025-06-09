const mongoose = require('mongoose');

const moderation = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // Công việc cần kiểm duyệt
  reports: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    reported_at: { type: Date, default: Date.now }
  }], // mỗi người dùng sẽ được báo cáo với các lý do riêng khác nhau. 
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin xử lý
  analysis:{
    hfAnalysis: { 
      nonOffensive: { type: Number, default: 0 }, // Non-offensive score
      offensive: { type: Number, default: 0 }, // Offensive score
      neutral: { type: Number, default: 0 }, // Neutral score
      positive: { type: Number, default: 0 }, // Positive score
      negative: { type: Number, default: 0 }, // Negative score
      hateSpeech: { type: Number, default: 0 }, // Hate speech score
      toxicity: { type: Number, default: 0 }, // Toxicity score
    },
    cohereResult: { type: String },
    awsAnalysis: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: true,
      default: 'pending'
    },
    reason: { type: String }
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'reported'], 
    required: true, 
    default: 'pending' 
  }, // Trạng thái duyệt
  reason: { type: String }, // Lý do báo cáo hoặc từ chối duyệt
  created_at: { type: Date, default: Date.now } // Thời gian tạo
});

module.exports = mongoose.model('Moderation', moderation);

