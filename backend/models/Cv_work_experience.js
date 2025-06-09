const mongoose = require('mongoose');

const workExperienceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv_profile', required: true },
  companyName: String,
  position: String,
  description: String,
  location: String,
  startDate: Date, 
  endDate: Date
});

module.exports = mongoose.model('cv_work_experience', workExperienceSchema);
