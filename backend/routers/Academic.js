const express = require('express');
const Academic = require('../models/Academic'); // Đường dẫn tới model Academic
const authenticateToken = require('../middleware/authenticateToken'); // Middleware JWT
const router = express.Router();

router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { user_id, industry, school_name, degree, start_date, end_date, achievements } = req.body;

    if (!user_id || !industry) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin học vấn.' });
    }

    const newAcademic = new Academic({
      user_id,
      industry,
      school_name,
      degree,
      start_date,
      end_date,
      achievements,
    });

    const savedAcademic = await newAcademic.save();

    // Trả về phản hồi thành công với dữ liệu lưu
    res.status(201).json({
      success: true,
      message: 'Thông tin học vấn đã được lưu thành công.',
      data: savedAcademic, // trả lại dữ liệu đã lưu
    });
  } catch (error) {
    console.error(error); // Log lỗi
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm thông tin học vấn.',
    });
  }
});


router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const academicData = await Academic.find({ user_id: userId });

    if (academicData.length === 0) {  // Check for empty array
      return res.status(200).json({ message: 'No academic data found for this user', academicData: null });
    }

    res.json(academicData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching academic data', error: error.message });
  }
});


// Sửa thông tin học vấn (UPDATE)
router.put('/edit/:id', authenticateToken, async (req, res) => {
  try {
    const academicId = req.params.id;

    // Tìm và cập nhật tài liệu
    const updatedAcademic = await Academic.findOneAndUpdate(
      { _id: academicId, user_id: req.userId }, // Kiểm tra quyền sở hữu bằng user_id
      req.body,
      { new: true } // Trả về tài liệu sau khi cập nhật
    );

    if (!updatedAcademic) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin học vấn.' });
    }

    res.json(updatedAcademic);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật thông tin học vấn.' });
  }
});

// Xóa thông tin học vấn (DELETE)
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const academicId = req.params.id;

    // Tìm và xóa tài liệu
    const deletedAcademic = await Academic.findOneAndDelete({
      _id: academicId,
      user_id: req.userId, // Kiểm tra quyền sở hữu bằng user_id
    });

    if (!deletedAcademic) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin học vấn để xóa.' });
    }

    res.json({ message: 'Đã xóa thành công.' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa thông tin học vấn.' });
  }
});

module.exports = router;
