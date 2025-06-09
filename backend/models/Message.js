const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  sent_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
