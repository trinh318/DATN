const mongoose = require('mongoose');

const jobStatsSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  views: Number,
  applications: Number,
  hires: Number,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JobStats', jobStatsSchema);
