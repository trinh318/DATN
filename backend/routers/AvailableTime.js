const AvailableTime = require('../models/AvailableTime');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const mongoose = require('mongoose');
 
router.post('/', async (req, res) => {
  try {
    const { job_id, interviewer_id, start_time, status } = req.body;

    // Đảm bảo start_time là đối tượng Date hợp lệ
    const startTime = new Date(start_time);
    if (isNaN(startTime)) {
      return res.status(400).json({ error: 'Thời gian không hợp lệ' });
    }

    // Kiểm tra và ép kiểu ObjectId nếu cần
    if (!mongoose.Types.ObjectId.isValid(job_id)) {
      return res.status(400).json({ message: 'Invalid jobId' });
    }

    if (!mongoose.Types.ObjectId.isValid(interviewer_id)) {
      return res.status(400).json({ message: 'Invalid jobId' });
    }

    // Tạo và lưu lịch hẹn
    const newAppointment = new AvailableTime({
      job_id: job_id,
      interviewer_id: interviewer_id,
      start_time: startTime,
      status
    });

    const populatedJob = await Job.findOne({ _id: new mongoose.Types.ObjectId(job_id) }).populate('company_id');

    const notification = new Notification({
      user_id: interviewer_id,
      title: `Kết quả ứng tuyển công việc ${populatedJob.title}`,
      message: `Công ty ${populatedJob.company_id.company_name} đã phê duyệt CV của bạn cho công việc ${populatedJob.title} mà chúng tôi đang tuyển dụng, vui lòng chọn khung giờ phỏng vấn phù hợp với bạn.`,
      read_status: false,
      created_at: new Date(),
    });

    await notification.save();
    await newAppointment.save();
    res.status(201).json(newAppointment); // Trả về lịch hẹn mới
  } catch (error) {
    console.error('Lỗi khi tạo lịch hẹn:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi tạo lịch hẹn' });
  }
});

router.get('/appointments/:applicantId', async (req, res) => {
  try {
    const { applicantId } = req.params;  // Lấy applicantId từ URL params
    const jobId = req.query.jobId;  // Lấy jobId từ query string

    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    // Tìm tất cả các lịch hẹn của ứng viên trong công việc này (bao gồm cả lịch "available" và "booked")
    const appointments = await AvailableTime.find({
      interviewer_id: applicantId,  // Ứng viên là người phỏng vấn (interviewer)
      job_id: jobId  // Công việc
    }).populate('job_id interviewer_id', 'title name');  // Populate thêm thông tin công việc và người phỏng vấn nếu cần

    // Nếu không có lịch nào
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this applicant and job' });
    }

    // Trả về danh sách tất cả các lịch hẹn (bao gồm "available" và "booked")
    return res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const appointments = await AvailableTime.aggregate([
      {
        $match: { interviewer_id: new mongoose.Types.ObjectId(userId) }, // Lọc theo userId
      },
      {
        $lookup: {
          from: 'jobs', // Collection jobs
          localField: 'job_id',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      {
        $unwind: '$jobDetails', // Phân rã mảng jobDetails
      },
      {
        $lookup: {
          from: 'companies', // Collection companies
          localField: 'jobDetails.company_id',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: '$companyDetails', // Phân rã mảng companyDetails
      },
      {
        $group: {
          _id: '$job_id', // Nhóm theo job_id
          jobName: { $first: '$jobDetails.title' }, // Lấy tên công việc từ jobDetails
          companyName: { $first: '$companyDetails.company_name' }, // Lấy tên công ty từ companyDetails
          availableTimes: {
            $push: {
              idTime: '$_id',
              time: '$start_time', // Đẩy thời gian phỏng vấn vào mảng
              confirmed: false, // Đẩy trạng thái xác nhận vào mảng
            },
          },
        },
      },
      {
        $addFields: {
          status: 'Chưa xác nhận', // Gán trạng thái mặc định
        },
      },
    ]);

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
});

// Update status to 'booked' by _id
router.put('/book/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the _id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid AvailableTime ID' });
    }

    // Find the record and update the status
    const updatedAvailableTime = await AvailableTime.findByIdAndUpdate(
      id,
      { status: 'booked' }, // Update status to 'booked'
      { new: true } // Return the updated document
    );

    if (!updatedAvailableTime) {
      return res.status(404).json({ message: 'AvailableTime not found' });
    }

    res.status(200).json({
      message: 'Status updated to booked successfully',
      data: updatedAvailableTime,
    });
  } catch (error) {
    console.error('Error updating AvailableTime status:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});





module.exports = router;