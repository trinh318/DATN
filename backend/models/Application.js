const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cover_letter: { type: String },
  status: { type: String, enum: ['under_review', 'interviewed', 'rejected'], required: true },
  applied_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
 