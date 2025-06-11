const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience'); // Import schema Experience
const mongoose = require('mongoose');

router.post('/add', async (req, res) => {
    try {
        const { userId, position, company, describe, startMonth, endMonth } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!userId || !position || !company || !startMonth) {
            return res.status(400).json({ message: 'Các trường bắt buộc không được để trống.' });
        }

        // Kiểm tra xem userId có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'userId không hợp lệ.' });
        }

        // Tạo kinh nghiệm mới
        const newExperience = new Experience({
            userId,
            position,
            company,
            describe,
            startMonth,
            endMonth: endMonth || null, // Nếu không có endMonth, gán giá trị null
        });

        // Lưu vào cơ sở dữ liệu
        await newExperience.save();

        // Trả về phản hồi
        res.status(201).json({
            success: true,
            message: 'Thêm kinh nghiệm thành công.',
            experience: newExperience,
        });

    } catch (error) {
        console.error('Lỗi khi thêm kinh nghiệm:', error); // Ghi log chi tiết lỗi trên server
        res.status(500).json({ message: 'Lỗi khi thêm kinh nghiệm.', error: error.message });
    }
});

router.put('/:experienceId/update', async (req, res) => {
    try {
        const { experienceId } = req.params;
        const { position, company, describe, startMonth, endMonth } = req.body;

        // Kiểm tra experienceId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(experienceId)) {
            return res.status(400).json({ message: 'experienceId không hợp lệ.' });
        }

        // Kiểm tra các trường bắt buộc
        if (!position || !company || !startMonth) {
            return res.status(400).json({ message: 'Các trường bắt buộc không được để trống.' });
        }

        // Tìm và cập nhật thông tin kinh nghiệm
        const updatedExperience = await Experience.findByIdAndUpdate(
            experienceId,
            {
                position,
                company,
                describe,
                startMonth,
                endMonth: endMonth || null
            },
            { new: true } // Trả về bản ghi sau khi cập nhật
        );

        if (!updatedExperience) {
            return res.status(404).json({ message: 'Không tìm thấy kinh nghiệm để cập nhật.' });
        }

        res.status(200).json({ message: 'Cập nhật kinh nghiệm thành công.', experience: updatedExperience });
    } catch (error) {
        console.error('Lỗi khi cập nhật kinh nghiệm:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật kinh nghiệm.', error: error.message });
    }
});

// Route lấy thông tin kinh nghiệm của một người
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Tìm tất cả kinh nghiệm theo userId
        const experiences = await Experience.find({ userId });

        if (!experiences.length) {
            return res.status(200).json({ message: 'Không tìm thấy kinh nghiệm cho người dùng này.', experiences: null });
        }

        res.status(200).json({ message: 'Lấy danh sách kinh nghiệm thành công.', experiences });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách kinh nghiệm.', error: error.message });
    }
});

router.delete('/:experienceId/delete', async (req, res) => {
  try {
    const { experienceId } = req.params;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(experienceId)) {
      return res.status(400).json({ message: 'experienceId không hợp lệ.' });
    }

    const deleted = await Experience.findByIdAndDelete(experienceId);

    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy kinh nghiệm để xoá.' });
    }

    res.status(200).json({ message: 'Xoá kinh nghiệm thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xoá kinh nghiệm.', error: error.message });
  }
});

module.exports = router;
