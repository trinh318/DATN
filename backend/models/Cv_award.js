const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv_profile', required: true },
  name: String,
  organization: String,
  dateEarned: Date 
});

module.exports = mongoose.model('cv_award', awardSchema);
 