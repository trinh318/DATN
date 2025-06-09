const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: String }, //chức danh, vị trí nghề ví dụ Nhân viên, trưởng phòng, leader,..
    company: { type: String}, // tên công ty
    describe: { type: String }, //mô tả công việc đã làm
    startMonth: { type: String }, // format 01/2001
    endMonth: { type: String, default: null }, // format 01/2001
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Experience', experienceSchema);
