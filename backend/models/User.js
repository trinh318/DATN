const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['applicant', 'recruiter', 'admin'], required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  avatar: { type: String },
  state: { type: String, enum: ['undefined', 'pending', 'approved', 'rejected'], required: true }, //hoạt động, đã xác thực, không hoạt động, vô hiệu hóa
  isGoogle: { type: Boolean, default: false },
  activeSubscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  last_login: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);