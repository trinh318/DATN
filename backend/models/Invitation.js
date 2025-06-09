const mongoose = require('mongoose');

// Định nghĩa schema cho invitation
const invitationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending' 
    }
});

// Đảm bảo mỗi ứng viên chỉ nhận được một lời mời cho mỗi công việc (jobId, recruiterId, candidateId phải là duy nhất)
invitationSchema.index({ jobId: 1, recruiterId: 1, candidateId: 1 }, { unique: true });

const Invitation = mongoose.model('Invitation', invitationSchema); // Tạo mô hình Invitation từ schema

module.exports = Invitation; // Export mô hình Invitation
