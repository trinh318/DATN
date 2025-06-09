const mongoose = require('mongoose');

const applicantScreeningResultSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  screening_status: { 
    type: String, 
    enum: ['Chấp nhận', 'Loại bỏ', 'Chờ đợi'], 
    required: true 
  },
  reasons_for_rejection: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Filter', applicantScreeningResultSchema);
