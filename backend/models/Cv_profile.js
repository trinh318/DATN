const mongoose = require('mongoose');

const cvProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, unique: true }, 
  title: String,
  firstName: String,
  lastName: String,
  gender: String,
  dateOfBirth: Date,
  email: String,
  phoneNumber: String, 
  address: String, 
  socialLinks: {
    linkedIn: String,
    twitter: String,
    facebook: String,
    github: String,
    website: String
  },
  professionalSummary: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

cvProfileSchema.pre('save', function (next) {
  if (!this.cvId) {
    this.cvId = this._id;
  }
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('cv_profile', cvProfileSchema);
