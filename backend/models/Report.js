const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  total_jobs: Number,
  total_applications: Number,
  total_users: Number,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
