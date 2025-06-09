const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const authenticateToken = require('../middleware/authenticateToken');
const Profile = require('../models/Profile');
const Company = require('../models/Company');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Job = require('../models/Job');

// POST - Tạo đơn ứ ng tuyển
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { job_id, cover_letter, status } = req.body;

    if (!job_id || !mongoose.Types.ObjectId.isValid(job_id)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const candidate_id = req.userId; // Candidate ID from the decoded token
    if (!candidate_id) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const profile = await Profile.findOne({ user_id: candidate_id });
    if (!profile) {
      return res.status(400).json({ message: 'Hồ sơ của bạn chưa đầy đủ. Vui lòng hoàn tất thông tin trước khi ứng tuyển.' });
    }

    // Danh sách các trường bắt buộc
    const requiredFields = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'nationality',
      'date_of_birth',
      'location',
      'specific_address',
      'job_title',
      'job_level',
      'current_industry',
      'years_of_experience',
    ];

    // Kiểm tra nếu bất kỳ trường nào bị thiếu hoặc không hợp lệ
    const missingFields = requiredFields.filter(field => !profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0));
    if (missingFields.length > 0) {
      return res.status(422).json({
        message: 'Hồ sơ của bạn chưa đầy đủ. Vui lòng hoàn tất thông tin trước khi ứng tuyển.',
        missingFields,
      });
    }

    // Kiểm tra nếu công việc đã đóng
    const job = await Job.findById(job_id);

    if (job.status === 'closed') {
      return res.status(400).json({ message: 'Công việc này đã không còn tuyển dụng.' });
    }

    // Kiểm tra nếu công việc đã hết hạn
    if (job.application_deadline && new Date() > job.application_deadline) {
      return res.status(400).json({ message: 'Đã quá hạn cho nộp đơn ứng tuyển.' });
    }

    // Kiểm tra nếu ứng viên đã ứng tuyển vào công việc này rồi
    const existingApplication = await Application.findOne({ job_id, candidate_id });

    if (existingApplication) {
      // Nếu ứng tuyển trước đó bị từ chối, cho phép ứng viên ứng tuyển lại
      if (existingApplication.status === 'không trúng tuyển' || existingApplication.status === 'đã từ chối') {
        existingApplication.cover_letter = cover_letter || existingApplication.cover_letter; // Cập nhật cover letter
        existingApplication.status = status || ''; // Cập nhật trạng thái nếu có
        await existingApplication.save();  // Cập nhật lại ứng tuyển

        return res.status(200).json({ message: 'Application updated successfully', application: existingApplication });
      }

      // Nếu ứng viên đã ứng tuyển và chưa bị từ chối, không cho phép nộp lại
      return res.status(400).json({ message: 'Bạn đã ứng tuyển công việc này trước đó.' });
    }

    // Nếu ứng viên chưa ứng tuyển, tạo ứng tuyển mới
    const application = new Application({
      job_id,
      candidate_id,
      cover_letter,
      status: status || 'under_review',
      applied_at: new Date(),
    });

    await application.save();

    // Tạo thông báo cho nhà tuyển dụng
    const notification = new Notification({
      user_id: job.employer_id._id,  // Employer ID
      message: `Có một ứng viên mới ứng tuyển vào công việc "${job.title}".`,
      job_id,
    });

    await notification.save();

    // Emit sự kiện thông báo cho nhà tuyển dụng
    req.io.emit('new-application', notification);
    req.io.to(job.employer_id._id.toString()).emit('notification', notification);

    res.status(201).json({ message: 'Application created successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// GET - Lấy tất cả đơn ứng tuyển cho một công việc
router.get('/job/:jobId', async (req, res) => {
  try {
    const applications = await Application.find({ job_id: req.params.jobId })
      .populate('candidate_id', 'username email phone avatar') // Lấy thông tin ứng viên
      .exec();

    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy ứng viên cho công việc này.' });
    }

    const result = [];
    for (let app of applications) {
      const profile = await Profile.findOne({ user_id: app.candidate_id._id }).exec();
      result.push({
        application: app,
        profile: profile || null,
        status: app.status,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Có lỗi khi lấy danh sách ứng viên.', error: err.message });
  }
});

// PUT - Duyệt ứng viên (Không kiểm tra quyền truy cập)
router.put('/approve/:applicationId', authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const { status } = req.body;

    // Tìm đơn ứng tuyển
    const application = await Application.findById(applicationId).exec();
    if (!application) {
      return res.status(404).json({ message: 'Ứng viên không tồn tại.' });
    }

    // Cập nhật trạng thái đơn ứng tuyển nếu có giá trị mới trong request
    application.status = status || 'under_review'; // Nếu không có status trong body thì mặc định là 'under_review'

    // Lưu lại thay đổi
    await application.save();

    // Trả về kết quả
    res.json({ message: 'Đơn ứng tuyển đã được duyệt.', application });
  } catch (err) {
    res.status(500).json({ message: 'Có lỗi khi duyệt ứng viên.', error: err.message });
  }
});
router.get('/myapplicantion/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const applications = await Application.find({ candidate_id: userId })
      .populate({
        path: 'job_id', // Populate thông tin công việc
        populate: { path: 'company_id' } // Populate thông tin công ty
      });

    res.status(200).json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách ứng tuyển.' });
  }
});

router.get('/applications-count/:candidateId', async (req, res) => {
  try {
    const candidateId = req.params.candidateId;

    // Kiểm tra xem candidateId có hợp lệ không
    if (!candidateId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp candidateId hợp lệ.' });
    }

    // Đếm số lượng đơn ứng tuyển của người dùng
    const count = await Application.countDocuments({ candidate_id: candidateId });

    res.json({ message: 'Số lượng đơn ứng tuyển lấy thành công.', count });
  } catch (error) {
    console.error('Lỗi khi lấy số lượng đơn ứng tuyển:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/check-application', async (req, res) => {
  try {
    const { job_id, candidate_id } = req.query;

    // Kiểm tra các tham số đầu vào
    if (!job_id || !candidate_id) {
      return res.status(400).json({ message: 'Thiếu job_id hoặc candidate_id' });
    }

    // Tìm kiếm trong cơ sở dữ liệu
    const application = await Application.findOne({ job_id, candidate_id });

    if (application) {
      return res.status(200).json({
        applied: true,
        message: 'Người dùng đã apply cho công việc này.',
        application, // Có thể trả chi tiết ứng dụng nếu cần
      });
    } else {
      return res.status(200).json({
        applied: false,
        message: 'Người dùng chưa apply cho công việc này.',
      });
    }
  } catch (error) {
    console.error('Lỗi kiểm tra application:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// PUT - Từ chối ứng viên theo jobId và applicationId
router.put('/reject/:jobId/:applicationId', async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: 'Job ID hoặc Application ID không hợp lệ.' });
    }

    // Tìm đơn ứng tuyển theo ID và job_id
    const application = await Application.findOne({ candidate_id: applicationId, job_id: jobId });

    if (!application) {
      return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
    }

    // Cập nhật trạng thái thành "rejected"
    application.status = 'rejected';
    await application.save();

    res.status(200).json({ message: 'Trạng thái đơn ứng tuyển đã được cập nhật thành "rejected".', application });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái bị từ chối:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
