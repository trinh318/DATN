const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }
}); 

const cvSkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv_profile', required: true },
  category: { type: String, required: true },
  skills: [skillSchema]
});

module.exports = mongoose.model('cv_skill', cvSkillSchema);
