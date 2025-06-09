const mongoose = require('mongoose');

const followedCompanySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FollowedCompany', followedCompanySchema);
