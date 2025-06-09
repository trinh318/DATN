const express = require('express');
const router = express.Router();
const SavedJob = require('../models/SavedJob');
const authenticateToken = require('../middleware/authenticateToken');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Notification = require('../models/Notification');  // Import mô hình Notification
const JobSave = require('../models/SavedJob');
const cron = require('node-cron');
const moment = require('moment');  // Để xử lý ngày tháng (cài đặt moment: `npm install moment`)

cron.schedule('0 9 * * *', async () => {
  // Cron job chạy vào mỗi 9 giờ sáng hàng ngày cron.schedule('*/2 * * * *', async () => { 2phut chay 1 lan
  try {
    const now = moment();
    const notificationTime = now.clone().add(1, 'days');  // Thông báo trước 1 ngày

    // Lấy tất cả công việc có hạn nộp trong 1 ngày tới
    const jobs = await Job.find({
      application_deadline: { $lte: notificationTime.toDate() },
      status: 'open',  // Lấy các công việc có trạng thái 'open'
    });

    for (const job of jobs) {
      // Lấy tất cả những người dùng đã lưu công việc này
      const jobSaves = await JobSave.find({ job_id: job._id });

      for (const jobSave of jobSaves) {
        // Lấy thông tin người dùng đã lưu công việc
        const user_id = jobSave.user_id;

        // Tạo thông báo cho người dùng
        const notification = new Notification({
          user_id,
          message: `Công việc "${job.title}" bạn đang lưu sắp hết hạn nộp hồ sơ vào ngày ${moment(job.application_deadline).format('YYYY-MM-DD')}`,
          read_status: false,
          created_at: new Date(),
        });
        await notification.save();
        console.log(`Notification created for user ${user_id}`);
      }
    }
  } catch (error) {
    console.error('Error sending job deadline notifications:', error);
  }
});

// CREATE - Lưu công việc mới savedjobs/save-job
router.post('/save-job', authenticateToken, async (req, res) => {
  const { job_id } = req.body;
  const user_id = req.userId; // Extracted from the JWT token

  try {
    // Check if the job has already been saved by this user
    const existingSavedJob = await SavedJob.findOne({ user_id, job_id });
    if (existingSavedJob) {
      return res.status(409).json({ message: 'Bạn đã lưu công việc này trước đó' });
    }

    // Save the job to the SavedJob collection
    const savedJob = new SavedJob({
      user_id,
      job_id,
    });
    if (!user_id) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để lưu công việc' }); // 'You need to log in to save a job'
    }
    await savedJob.save();
    res.status(201).json({ message: 'Job saved successfully', savedJob });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/user/me', authenticateToken, async (req, res) => {
  const userId = req.userId; // userId đã được xác thực từ JWT token

  try {
    // Tìm tất cả công việc đã lưu của người dùng trong SavedJob collection
    const savedJobs = await SavedJob.find({ user_id: userId }).populate('job_id');
    
    if (savedJobs.length === 0) {
      return res.status(404).json({ message: 'Không có công việc đã lưu.' });
    }

    // Trả về danh sách công việc đã lưu
    res.json(savedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

router.get('/mysavedjobs/:userId', async (req, res) => {
  console.log('Request received for userId:', req.params.userId);
  try {
      const { userId } = req.params;
      const savedJobs = await SavedJob.find({ user_id: userId }).populate({
          path: 'job_id',
          populate: { path: 'company_id' }
      });

      if (!savedJobs) {
          return res.status(404).json({ message: 'Không tìm thấy công việc đã lưu.' });
      }

      res.status(200).json(savedJobs);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách công việc đã lưu.' });
  }
});


// DELETE - Xóa công việc đã lưu
router.delete('/:id', authenticateToken, async (req, res) => {
  const savedJobId = req.params.id;  // Lấy ID công việc đã lưu từ URL

  try {
    // Tìm và xóa công việc đã lưu theo ID
    const deletedSavedJob = await SavedJob.findByIdAndDelete(savedJobId);

    if (!deletedSavedJob) {
      return res.status(404).json({ message: 'Công việc đã lưu không tìm thấy' });
    }

    // Trả về thông báo xóa thành công
    res.json({ message: 'Công việc đã được xóa thành công!' });
  } catch (error) {
    console.error('Error deleting saved job:', error);  // Log lỗi cho debug
    res.status(500).json({ message: 'Lỗi server khi xóa công việc', error });
  }
});


module.exports = router;
