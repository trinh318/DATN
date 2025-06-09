const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  careers: [
    {
      _id: false,
      title: {
        type: String,
        required: true,
        trim: true
      }
    }
  ],
  state: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
