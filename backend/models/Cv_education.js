const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv_profile', required: true },
  university: String,
  city: String,
  gpa: String,
  degree: String,
  major: String,
  startDate: Date,
  endDate: Date,
  additionalInfo: String 
});

module.exports = mongoose.model('cv_education', educationSchema);
