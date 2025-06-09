const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// CREATE - Tạo một feedback mới
router.post('/', async (req, res) => {
  try {
    const { job_id, from_user_id, to_user_id, rating, comment } = req.body;
    const feedback = new Feedback({
      job_id,
      from_user_id,
      to_user_id,
      rating,
      comment
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback created successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy tất cả feedback cho một công việc cụ thể
router.get('/job/:job_id', async (req, res) => {
  try {
    const job_id = req.params.job_id;
    const feedbacks = await Feedback.find({ job_id }).populate('from_user_id').populate('to_user_id');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy tất cả feedback của một người dùng cụ thể
router.get('/user/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const feedbacks = await Feedback.find({ to_user_id: user_id }).populate('job_id').populate('from_user_id');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// UPDATE - Cập nhật feedback
router.put('/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { rating, comment, updated_at: Date.now() },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback updated successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE - Xóa feedback
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
// Gửi phản hồi
router.post('/feedback', async (req, res) => {
    const { job_id, from_user_id, to_user_id, rating, comment } = req.body;
  
    try {
      const feedback = new Feedback({ job_id, from_user_id, to_user_id, rating, comment });
      await feedback.save();
      res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
  
module.exports = router;
