const mongoose = require('mongoose')

const CvFileSchema = new mongoose.Schema({
    originalName: String, // Tên file gốc
    fileName: String, // Tên file được generate     url: String, // URL hoặc path của file đã lưu
    mimeType: String, // Loại file (image/jpeg, application/pdf, ...)
    size: Number, // Kích thước file (bytes)// Loại entity liên kết
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    is_active: { type: Boolean, default: true }
}, {
    timestamps: true
}
)

module.exports = mongoose.model('CvFile', CvFileSchema)
