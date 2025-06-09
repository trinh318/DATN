const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv_profile', required: true },
  name: String, 
  publisher: String,
  date: Date,
  additionalInfo: String
});

module.exports = mongoose.model('cv_publication', publicationSchema);
