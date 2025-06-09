// server/models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company_name: { type: String, required: true },
  description: { type: String },
  industry: { type: String },
  location: { type: String },
  specific_address: { type: String },
  website: { type: String },
  logo: { type: String },
  banner: {type: String},
  quymo: { type: String },
  highlight: { type: Boolean, default: false },
  highlight_expiration: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}); 

const Company = mongoose.model('Company', companySchema);

module.exports = Company;