const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const AvailableTime = require('../models/AvailableTime');
const authenticateToken = require('../middleware/authenticateToken');

// CREATE - Tạo một buổi phỏng vấn mới
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { job_id, candidate_id } = req.body;  // Đã bỏ location
    
    // Lấy userId từ request đã được gán trong authenticateToken middleware
    const interviewer_id = req.userId;  // Đây là ID của người đang đăng nhập
    
    if (!job_id || !candidate_id ) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
    }

    // Tạo buổi phỏng vấn mới
    const interview = new Interview({
      job_id,
      candidate_id,
      interviewer_id,
      available_time_id: null,
      status: 'chưa phỏng vấn', // Trạng thái mặc định
    });

    await interview.save();
    res.status(201).json({ message: 'Interview scheduled successfully', interview });
  } catch (error) {
    console.error('Lỗi khi tạo buổi phỏng vấn:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/confirm/:availableTimeId', authenticateToken, async (req, res) => {
  const { availableTimeId } = req.params;

  try {
    // Tìm kiếm thời gian khả dụng theo ID
    const availableTime = await AvailableTime.findById(availableTimeId);
    if (!availableTime) {
      return res.status(404).json({ message: 'Không tìm thấy thời gian khả dụng.' });
    }

    // Tìm cuộc phỏng vấn đã tồn tại (dựa trên job_id và candidate_id)
    const interview = await Interview.findOne({
      job_id: availableTime.job_id,
      candidate_id: req.userId,  // ID người dùng đã đăng nhập
      status: { $in: ['chưa phỏng vấn', 'đang đợi phỏng vấn'] }  // Chỉ tìm các cuộc phỏng vấn chưa hoặc đang đợi
    });

    if (!interview) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc phỏng vấn này.' });
    }

    // Cập nhật thời gian khả dụng cho cuộc phỏng vấn và thay đổi trạng thái
    interview.available_time_id = availableTimeId;
    interview.status = 'đang đợi phỏng vấn';  // Cập nhật trạng thái cuộc phỏng vấn

    await interview.save();  // Lưu thay đổi

    res.status(200).json({
      message: 'Lịch phỏng vấn đã được xác nhận thành công.',
      interview,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật cuộc phỏng vấn:', error);
    res.status(500).json({ message: 'Lỗi server.', error });
  }
});

// Định nghĩa API GET lấy thông tin phỏng vấn
router.get('/time/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc phỏng vấn.' });
    }

    res.status(200).json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin phỏng vấn.', error });
  }
});


router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // Lấy userId từ middleware authenticateToken

    // Tìm tất cả các cuộc phỏng vấn mà userId là interviewer_id
    const interviews = await Interview.find({ interviewer_id: userId })
      .populate('job_id', 'title')  // Lấy tiêu đề công việc từ job_id
      .exec();

    if (!interviews) {
      return res.status(404).json({ message: 'Không có cuộc phỏng vấn nào' });
    }

    res.status(200).json({ interviews });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phỏng vấn:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// READ - Lấy tất cả các buổi phỏng vấn cho một công việc cụ thể
router.get('/job/:job_id', async (req, res) => {
  try {
    const job_id = req.params.job_id;
    const interviews = await Interview.find({ job_id }).populate('candidate_id');
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy tất cả các buổi phỏng vấn cho một ứng viên cụ thể
router.get('/candidate/:candidate_id', async (req, res) => {
  try {
    const candidate_id = req.params.candidate_id;
    const interviews = await Interview.find({ candidate_id }).populate('job_id');
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


// DELETE - Xóa buổi phỏng vấn
router.delete('/:id', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/select-time/:availableTimeId', authenticateToken, async (req, res) => {
  const { availableTimeId } = req.params;

  try {
    const availableTime = await AvailableTime.findById(availableTimeId);
    if (!availableTime || availableTime.status === 'booked') {
      return res.status(400).json({ message: 'Khoảng thời gian này đã bị chọn hoặc không hợp lệ' });
    }

    // Cập nhật trạng thái khoảng thời gian thành "booked"
    availableTime.status = 'booked';
    await availableTime.save();

    // Tạo buổi phỏng vấn mới
    const interview = new Interview({
      job_id: availableTime.job_id,
      candidate_id: req.userId,
      interviewer_id: availableTime.interviewer_id,
      interview_date: availableTime.start_time,
      location: 'Online',
      status: 'scheduled',
    });

    await interview.save();
    res.status(200).json({ message: 'Cuộc phỏng vấn đã được xác nhận', interview });
  } catch (err) {
    console.error('Lỗi khi chọn thời gian phỏng vấn:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { interview_date, available_time_id } = req.body;

  if (!interview_date || !available_time_id) {
    return res.status(400).json({ message: 'Vui lòng cung cấp thời gian phỏng vấn và khoảng thời gian hợp lệ.' });
  }

  try {
    const interviewDate = new Date(interview_date);

    // Kiểm tra xem khoảng thời gian được chọn có tồn tại và hợp lệ không
    const availableTime = await AvailableTime.findById(available_time_id);

    if (!availableTime) {
      return res.status(404).json({ message: 'Không tìm thấy khoảng thời gian khả dụng.' });
    }

    // Kiểm tra thời gian phỏng vấn có nằm trong khoảng thời gian khả dụng không
    if (interviewDate < availableTime.start_time || interviewDate > availableTime.end_time) {
      return res.status(400).json({ message: 'Thời gian phỏng vấn không nằm trong khoảng thời gian khả dụng.' });
    }

    // Cập nhật thời gian phỏng vấn
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin phỏng vấn.' });
    }

    // Cập nhật thời gian phỏng vấn trong cơ sở dữ liệu
    interview.interview_date = interviewDate;
    await interview.save();

    res.status(200).json({ message: 'Cập nhật thời gian phỏng vấn thành công.', interview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật thời gian phỏng vấn.', error });
  }
});

module.exports = router;
