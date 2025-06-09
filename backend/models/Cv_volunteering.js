const mongoose = require('mongoose');

const volunteeringSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv_profile', required: true },
  organization: String,
  involvement: String,
  city: String,
  startDate: Date, 
  endDate: Date,
  additionalInfo: String
});

module.exports = mongoose.model('cv_volunteering', volunteeringSchema);
