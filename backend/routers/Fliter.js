const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const ApplicantScreeningResult = require('../models/Filter');

// Lọc ứng viên theo yêu cầu công việc và lưu kết quả sàng lọc
router.get('/filter-applicants/:job_id', async (req, res) => {
  try {
    // Lấy thông tin công việc
    const job = await Job.findById(req.params.job_id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Lọc ứng viên dựa trên kỹ năng và bằng cấp
    const profiles = await Profile.find();

    // Lọc ra ứng viên phù hợp
    const screeningResults = [];

    for (let profile of profiles) {
      let screeningStatus = 'Chờ đợi';  // Mặc định là trạng thái "Chờ đợi"
      let reasonsForRejection = '';

      // Kiểm tra kỹ năng: ứng viên có ít nhất một kỹ năng yêu cầu không?
      const skillsMatch = job.skills_required.some(skill => profile.skills.includes(skill));

      // Kiểm tra bằng cấp: ứng viên có ít nhất một bằng cấp yêu cầu không?
      const qualificationsMatch = job.qualifications_required.some(qualification => profile.education.includes(qualification));

      if (skillsMatch && qualificationsMatch) {
        // Nếu ứng viên có đủ kỹ năng và bằng cấp, gán trạng thái "Chấp nhận"
        screeningStatus = 'Chấp nhận';
      } else {
        // Nếu ứng viên không đủ kỹ năng hoặc bằng cấp, gán trạng thái "Loại bỏ"
        screeningStatus = 'Loại bỏ';

        // Ghi lý do từ chối (nếu thiếu kỹ năng hoặc bằng cấp)
        if (!skillsMatch) {
          reasonsForRejection = 'Thiếu kỹ năng yêu cầu';
        }
        if (!qualificationsMatch) {
          reasonsForRejection = reasonsForRejection
            ? reasonsForRejection + ', thiếu bằng cấp yêu cầu'
            : 'Thiếu bằng cấp yêu cầu';
        }
      }

      // Tạo kết quả sàng lọc cho mỗi ứng viên và lưu vào cơ sở dữ liệu
      const screeningResult = await ApplicantScreeningResult.create({
        job_id: job._id,
        candidate_id: profile._id,
        screening_status: screeningStatus,
        reasons_for_rejection: reasonsForRejection,
      });

      screeningResults.push(screeningResult);
    }

    // Trả về kết quả sàng lọc đã được lưu
    res.json(screeningResults);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;