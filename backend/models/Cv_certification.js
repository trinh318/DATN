const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv_profile', required: true },
  name: String,
  score: String,
  startDate: Date,
  endDate: Date
}); 

module.exports = mongoose.model('cv_certification', certificationSchema);
