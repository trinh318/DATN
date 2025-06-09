const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

  rating: { type: Number, required: true, min: 1, max: 5 }, // Overall rating
  summary: { type: String, required: false },
  comment: { type: String, required: true }, // Có thể gộp với what_i_love nếu muốn đơn giản
  recommend: { type: Boolean, required: true },

  overtime_feeling: { type: String, enum: ["satisfied", "unsatisfied"], required: true },
  overtime_reason: { type: String, required: true },
  what_i_love: { type: String, required: true },
  suggestion: { type: String,  required: true },

  anonymous: { type: Boolean, default: false },

  details: {
    salary_benefits: { type: Number, min: 1, max: 5 },
    training: { type: Number, min: 1, max: 5 },
    management: { type: Number, min: 1, max: 5 },
    culture: { type: Number, min: 1, max: 5 },
    workspace: { type: Number, min: 1, max: 5 },
  },

  responses: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
    },
  ],

  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  admin_note: { type: String },

  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", ReviewSchema);
