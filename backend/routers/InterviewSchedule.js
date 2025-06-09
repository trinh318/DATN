const InterviewSchedule = require('../models/InterviewSchedule');
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Profile = require('../models/Profile');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
    try {
        const { job_id, candidate_id, start_time, location, notes, status } = req.body;

        console.log("jobid", job_id)
        // Đảm bảo start_time là đối tượng Date hợp lệ
        const startTime = new Date(start_time);
        if (isNaN(startTime)) {
            return res.status(400).json({ error: 'Thời gian không hợp lệ' });
        }

        // Kiểm tra và ép kiểu ObjectId nếu cần
        if (!mongoose.Types.ObjectId.isValid(job_id)) {
            return res.status(400).json({ message: 'Invalid jobId' });
        }

        if (!mongoose.Types.ObjectId.isValid(candidate_id)) {
            return res.status(400).json({ message: 'Invalid candidateId' });
        }

        const populatedJob = await Job.findOne({ _id: new mongoose.Types.ObjectId(job_id) }).populate('company_id');

        // Tạo và lưu lịch hẹn
        const newAppointment = new InterviewSchedule({
            job_id: job_id,
            candidate_id: candidate_id,
            interviewer_id: populatedJob.company_id.user_id,
            start_time: startTime,
            location: location,
            notes: notes,
            status
        });

        const notification = new Notification({
            user_id: candidate_id,
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

router.get('/available-times', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const availableTimes = await InterviewSchedule.aggregate([
            {
                $match: {
                    candidate_id: new mongoose.Types.ObjectId(userId),
                    status: { $nin: ['cancle'] },
                },
            },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job_id',
                    foreignField: '_id',
                    as: 'jobDetails',
                },
            },
            { $unwind: '$jobDetails' },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'jobDetails.company_id',
                    foreignField: '_id',
                    as: 'companyDetails',
                },
            },
            { $unwind: '$companyDetails' },

            // Lấy application status
            {
                $lookup: {
                    from: 'applications',
                    let: { jobId: '$job_id', candidateId: '$candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$job_id', '$$jobId'] },
                                        { $eq: ['$candidate_id', '$$candidateId'] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: { status: 1 }
                        }
                    ],
                    as: 'applicationInfo',
                },
            },

            {
                $group: {
                    _id: '$job_id',
                    jobName: { $first: '$jobDetails.title' },
                    interview_location: { $first: '$jobDetails.interview_location' },
                    companyName: { $first: '$companyDetails.company_name' },
                    companyIndustry: { $first: '$companyDetails.industry' },
                    applicationStatus: { $first: { $arrayElemAt: ['$applicationInfo.status', 0] } },
                    availableTimes: {
                        $push: {
                            idTime: '$_id',
                            time: '$start_time',
                            location: '$location',
                            status: '$status',
                        },
                    },
                },
            },
        ]);

        res.json(availableTimes);
    } catch (err) {
        console.error('Error fetching available times:', err);
        res.status(500).json({ error: 'Failed to fetch available times', details: err.message });
    }
});

// Route cập nhật nhiều InterviewSchedules
router.put('/update-schedules', async (req, res) => {
    try {
        const { user_id, job_id, schedules } = req.body;

        // Kiểm tra nếu không có dữ liệu hoặc không phải là mảng
        if (!Array.isArray(schedules) || schedules.length === 0) {
            return res.status(400).json({ error: 'Schedules array is required and cannot be empty.' });
        }

        const validStatuses = ['available', 'cancle', 'Chờ phê duyệt', 'Đang đợi phỏng vấn', 'Đã phỏng vấn', 'Hủy'];
        const updateResults = []; // Lưu kết quả từng update

        // Xử lý từng phần tử trong mảng
        for (const schedule of schedules) {
            const { candidateId, idTime, jobId, status } = schedule;

            // Kiểm tra thông tin đầu vào
            if (!candidateId || !idTime || !jobId || !status) {
                return res.status(400).json({ error: 'Each schedule must include candidateId, idTime, jobId, and status.' });
            }

            // Kiểm tra trạng thái hợp lệ
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: `Invalid status for schedule with idTime ${idTime}. Valid statuses are: ${validStatuses.join(', ')}` });
            }

            // Tìm và cập nhật lịch phỏng vấn
            const updatedSchedule = await InterviewSchedule.findOneAndUpdate(
                { _id: idTime, candidate_id: candidateId, job_id: jobId }, // Điều kiện tìm kiếm
                { status: status, updated_at: Date.now() },               // Cập nhật trạng thái và thời gian cập nhật
                { new: true }                                            // Trả về document đã được cập nhật
            );

            // Lưu kết quả
            if (updatedSchedule) {
                updateResults.push({ idTime, success: true, data: updatedSchedule });
            } else {
                updateResults.push({ idTime, success: false, error: 'Schedule not found or invalid input.' });
            }
        }

        const populatedJob = await Job.findOne({ _id: new mongoose.Types.ObjectId(job_id) }).populate('company_id');
        const candidateProfile = await Profile.findOne({ user_id: user_id });

        const notification = new Notification({
            user_id: populatedJob.company_id.user_id,
            title: `Xác nhận thời gian phỏng vấn ${populatedJob.title}`,
            message: `Ứng viên ${candidateProfile.first_name} ${candidateProfile.last_name} đã xác nhận chọn lịch phỏng vấn cho công việc ${populatedJob.title}`,
            read_status: false,
            created_at: new Date(),
        });

        await notification.save();

        // Trả về kết quả tổng hợp
        res.status(200).json({ message: 'Schedules update processed.', results: updateResults });
    } catch (err) {
        console.error('Error updating schedules:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Cập nhật thông tin lịch phỏng vấn
router.put('/update-schedule/:id', async (req, res) => {
    const { id } = req.params; // Lấy ID của lịch phỏng vấn
    const { start_time, location, status, notes, jobId } = req.body; // Lấy thông tin từ body

    // Kiểm tra và ép kiểu ObjectId nếu cần
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
    }

    try {
        // Tìm và cập nhật lịch phỏng vấn
        const updatedSchedule = await InterviewSchedule.findByIdAndUpdate(
            id,
            {
                $set: {
                    start_time: start_time ? new Date(start_time) : undefined, // Cập nhật thời gian phỏng vấn
                    location: location || undefined, // Cập nhật địa điểm
                    status: status || undefined, // Cập nhật trạng thái
                    notes: notes || undefined, // Cập nhật ghi chú
                },
            },
            { new: true, runValidators: true } // Trả về tài liệu mới nhất và kiểm tra validation
        );

        const populatedJob = await Job.findOne({ _id: new mongoose.Types.ObjectId(jobId) }).populate('company_id');

        const notification = new Notification({
            user_id: updatedSchedule.candidate_id,
            title: `Thông báo phỏng vấn cho công việc ${populatedJob.title}`,
            message: `Nhà tuyển dụng đã xác nhận lịch phỏng vấn của bạn cho công việc ${populatedJob.title}`,
            read_status: false,
            created_at: new Date(),
        });

        await notification.save();

        if (!updatedSchedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.status(200).json({ success: true, message: 'Schedule updated successfully', data: updatedSchedule });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ success: false, message: 'Error updating schedule', error: error.message });
    }
});

router.get('/applied-job/schedules', async (req, res) => {
    const { candidateId, jobId } = req.query;

    if (!candidateId || !jobId) {
        return res.status(400).json({ message: 'Missing candidateId or jobId' });
    }

    try {
        const schedules = await InterviewSchedule.find({
            candidate_id: candidateId,
            job_id: jobId
        }).sort({ start_time: 1 }); // sắp xếp theo thời gian tăng dần

        console.log(schedules)
        res.status(200).json({ success: true, data: schedules });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ success: false, message: 'Error fetching schedules', error: error.message });
    }
});

router.put('/interviews/cancel', async (req, res) => {
    try {
        const { job_id, candidate_id } = req.body;

        if (!job_id || !candidate_id) {
            return res.status(400).json({ message: 'job_id và candidate_id là bắt buộc.' });
        }

        const result = await InterviewSchedule.updateMany(
            {
                job_id,
                candidate_id,
                status: { $nin: ['cancle', 'Hủy'] } // 💡 Chỉ cập nhật nếu status KHÔNG phải là "cancle" hoặc "Hủy"
            },
            {
                $set: { status: 'Hủy', updated_at: new Date() }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch phỏng vấn hợp lệ để hủy.' });
        }

        res.status(200).json({
            message: `Đã hủy ${result.modifiedCount} lịch phỏng vấn.`,
        });
    } catch (error) {
        console.error('Lỗi khi hủy lịch phỏng vấn:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý yêu cầu.' });
    }
});

router.put('/interviews/confirm', async (req, res) => {
    try {
        const { job_id, candidate_id } = req.body;

        if (!job_id || !candidate_id) {
            return res.status(400).json({ message: 'job_id và candidate_id là bắt buộc.' });
        }

        const result = await InterviewSchedule.updateMany(
            {
                job_id,
                candidate_id,
                status: { $ne: 'cancle' }  // ❗ Chỉ cập nhật những lịch chưa bị hủy
            },
            {
                $set: {
                    status: 'Đang đợi phỏng vấn',
                    updated_at: new Date()
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch phỏng vấn hợp lệ để cập nhật.' });
        }

        res.status(200).json({
            message: `Đã xác nhận ${result.modifiedCount} lịch phỏng vấn.`,
        });
    } catch (error) {
        console.error('Lỗi khi xác nhận lịch phỏng vấn:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý yêu cầu.' });
    }
});

module.exports = router;