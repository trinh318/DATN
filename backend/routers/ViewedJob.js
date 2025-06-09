const express = require('express');
const router = express.Router();
const ViewedJob = require('../models/ViewedJob'); // Đường dẫn đến model ViewedJob

// Route thêm mới bản ghi nếu chưa tồn tại
router.post('/view-job', async (req, res) => {
  try {
    const { user_id, job_id } = req.body;
    console.log( 'thong tin',job_id, user_id);
    // Kiểm tra xem người dùng đã xem công việc này chưa
    const existingViewedJob = await ViewedJob.findOne({ user_id, job_id });

    if (existingViewedJob) {
      console.log('ban da xem thong tin nay roi');
      return res.status(201).json({ message: 'Bạn đã xem công việc này rồi.' });
      
    }

    // Tạo bản ghi mới nếu chưa có
    const newViewedJob = new ViewedJob({
      user_id,
      job_id,
    });

    await newViewedJob.save();

    res.status(201).json({ message: 'Đã lưu công việc đã xem.', viewedJob: newViewedJob });
  } catch (error) {
    console.error('Error adding viewed job:', error);
    res.status(500).json({ message: 'Lỗi khi thêm công việc đã xem.', error: error.message });
  }
});

// Route: Lấy danh sách công việc đã xem của một user, kèm thông tin công ty
router.get('/viewed-jobs/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Tìm tất cả các công việc đã xem bởi user_id
    const viewedJobs = await ViewedJob.find({ user_id: user_id })
      .populate({
        path: 'job_id', // Lấy thông tin công việc
        populate: {
          path: 'company_id', // Lấy thông tin công ty từ công việc
        }
      });

    res.status(200).json({
      message: 'Danh sách công việc đã xem.',
      viewedJobs,
    });
  } catch (error) {
    console.error('Error fetching viewed jobs:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách công việc đã xem.',
      error: error.message,
    });
  }
});

module.exports = router;
