const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SavedJob', savedJobSchema);
