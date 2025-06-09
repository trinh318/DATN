const express = require('express');
const router = express.Router();
const JobStats = require('../models/JobStats');

// CREATE - Tạo một bản thống kê công việc mới
router.post('/', async (req, res) => {
  try {
    const { job_id, views, applications, hires } = req.body;
    const jobStats = new JobStats({ job_id, views, applications, hires });
    await jobStats.save();
    res.status(201).json({ message: 'Job stats created successfully', jobStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy thống kê của một công việc cụ thể
router.get('/:job_id', async (req, res) => {
  try {
    const job_id = req.params.job_id;
    const jobStats = await JobStats.findOne({ job_id });
    if (!jobStats) return res.status(404).json({ message: 'Job stats not found' });
    res.json(jobStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// UPDATE - Cập nhật thống kê công việc
router.put('/:id', async (req, res) => {
  try {
    const { views, applications, hires } = req.body;
    const jobStats = await JobStats.findByIdAndUpdate(
      req.params.id,
      { views, applications, hires },
      { new: true }
    );
    if (!jobStats) return res.status(404).json({ message: 'Job stats not found' });
    res.json({ message: 'Job stats updated successfully', jobStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE - Xóa thống kê công việc
router.delete('/:id', async (req, res) => {
  try {
    const jobStats = await JobStats.findByIdAndDelete(req.params.id);
    if (!jobStats) return res.status(404).json({ message: 'Job stats not found' });
    res.json({ message: 'Job stats deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
