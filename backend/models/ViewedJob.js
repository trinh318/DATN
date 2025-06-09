const mongoose = require('mongoose');

const viewedJobsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ViewedJob', viewedJobsSchema);
