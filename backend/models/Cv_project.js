const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv_profile', required: true },
  name: String,
  organization: String,
  description: String,
  technologies: String,
  startDate: Date,
  endDate: Date,
  additionalInfo: String, 
  link: String
});

module.exports = mongoose.model('cv_project', projectSchema);
