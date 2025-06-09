const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // Thời gian sử dụng gói, ví dụ: 30 ngày
    required: true
  },
  postLimit: {
    type: Number, // Ví dụ: Starter chỉ cho đăng tối đa 3 bài/tháng
    default: 0
  },
  features: [{
    key: { type: String, required: true },       // ex: "post_jobs"
    label: { type: String, required: true },     // ex: "Đăng tin tuyển dụng"
  }],
  priority: { 
    type: Number, 
    required: true,
    default: 0
  }, // độ ưu tiên 
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: [,'active', 'inactive'],
    default: 'active'
  }  
});

module.exports = mongoose.model('Package', packageSchema);
