const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Tiêu đề bài kiểm tra
    description: { type: String, required: true }, // Mô tả chi tiết về bài kiểm tra
   // type: { type: String, required: true }, // Loại bài kiểm tra
    duration: { type: Number, required: true }, // Thời gian làm bài kiểm tra (phút)
    created_at: { type: Date, default: Date.now }, // Thời gian tạo bài kiểm tra
    updated_at: { type: Date, default: Date.now }, // Thời gian cập nhật bài kiểm tra
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // ID của người tạo bài kiểm tra
});

module.exports = mongoose.model('Test', testSchema);
