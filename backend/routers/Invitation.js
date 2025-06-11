const express = require("express");
const router = express.Router();
const Invitation = require("../models/Invitation"); // Model thư mời
const Job = require("../models/Job");              // Model công việc
const User = require("../models/User");            // Model người dùng
const Company = require("../models/Company");
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const checkFeatureAccess = require('../middleware/checkFeatureAccess');
const authenticateToken = require('../middleware/authenticateToken');

router.post("/", authenticateToken, checkFeatureAccess('invite_candidates'), async (req, res) => {
    const { jobId, recruiterId, candidateId, message, isTest } = req.body;

    try {
        const job = await Job.findById(jobId);
        const recruiter = await User.findById(recruiterId);
        const candidate = await User.findById(candidateId);

        if (!job || !recruiter || !candidate) {
            return res.status(404).json({ message: "Job, Recruiter, or Candidate not found" });
        }

        const existingInvitation = await Invitation.findOne({
            jobId,
            recruiterId,
            candidateId,
            status: "pending",
        });

        if (existingInvitation) {
            return res.status(400).json({ message: "Ứng viên đã được mời ứng tuyển công việc này và đang chờ xử lý." });
        }

        const newInvitation = new Invitation({
            jobId,
            recruiterId,
            candidateId,
            message,
            isTest: !!isTest, // đảm bảo kiểu Boolean
            status: "pending",
        });

        const notification = new Notification({
            user_id: candidateId,
            message: `Bạn nhận được lời mời vào công việc "${job.title}".`,
        });

        await notification.save();
        await newInvitation.save();
        res.status(201).json({ message: "Gửi lời mời thành công" });
    } catch (error) {
        console.error("Error in invitation creation:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const invitation = await Invitation.findById(id);
        if (!invitation) {
            return res.status(404).json({ message: "Invitation not found" });
        }

        await Invitation.findByIdAndDelete(id);
        res.status(200).json({ message: "Invitation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
router.get("/by-recruiter/:recruiterId", async (req, res) => {
    const { recruiterId } = req.params;  // Lấy recruiterId từ URL params

    try {
        // Tìm các công việc mà recruiterId đã đăng, dựa trên employer_id trong schema (chắc chắn đây là trường bạn cần truy vấn)
        const jobs = await Job.find({ employer_id: recruiterId });

        if (jobs.length === 0) {
            return res.status(404).json({ message: "No jobs found for this recruiter" });
        }

        // Trả về các công việc tìm thấy
        res.status(200).json({ jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get('/invitations-by-candidate/:candidateId', async (req, res) => {
    const { candidateId } = req.params;

    try {
        // Lấy tất cả thư mời của ứng viên và populate jobId, recruiterId và companyId
        const invitations = await Invitation.find({ candidateId, status: 'pending' })
            .populate({
                path: 'jobId',
                populate: {
                    path: 'company_id',
                    model: 'Company', // Đảm bảo populate đúng model 'Company'
                },
            })
            .populate('recruiterId') // Populated recruiterId để lấy thông tin nhà tuyển dụng
            .exec();

        if (invitations.length === 0) {
            return res.status(404).json({ message: 'Không có thư mời nào cho ứng viên này.' });
        }

        // Trả về thư mời và thông tin công việc bao gồm toàn bộ thông tin công ty
        res.status(200).json({
            invitations: invitations.map(invitation => ({
                invitationId: invitation._id,
                message: invitation.message,
                status: invitation.status,
                isTest: invitation.isTest,
                job: invitation.jobId, // Thông tin công việc
                recruiter: invitation.recruiterId, // Thông tin nhà tuyển dụng
                company: invitation.jobId.companyId, // Thông tin công ty đầy đủ
            }))
        });
    } catch (error) {
        console.error('Error fetching invitations:', error.message);
        res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
});
router.post('/accept/acp-invited/:invitationId', async (req, res) => {
    const { invitationId } = req.params;

    try {
        // Tìm lời mời
        const invitation = await Invitation.findById(invitationId).populate('jobId');

        if (!invitation) { 
            return res.status(404).json({ message: 'Lời mời không tồn tại.' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Lời mời đã được xử lý.' });
        }

        invitation.status = 'accepted';
        await invitation.save();
        // Tạo thông báo cho nhà tuyển dụng
        const notificationMessage = `Có một ứng viên chấp nhận lời mời vào công việc "${invitation.jobId.title}".`;
        const notification = new Notification({
            user_id: invitation.recruiterId, // ID của nhà tuyển dụng
            message: notificationMessage,
        });
        await notification.save();

        res.status(200).json({
            message: 'Lời mời đã được chấp nhận, ứng tuyển thành công, và thông báo đã được gửi.',
        });
    } catch (error) {
        console.error('Error accepting invitation:', error.message);
        res.status(500).json({ message: 'Lỗi hệ thống.', error: error.message });
    }
});
router.post('/accept/:invitationId', async (req, res) => {
    const { invitationId } = req.params;

    try {
        // Tìm lời mời
        const invitation = await Invitation.findById(invitationId).populate('jobId');

        if (!invitation) { 
            return res.status(404).json({ message: 'Lời mời không tồn tại.' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Lời mời đã được xử lý.' });
        }
        // Thêm vào bảng ứng tuyển
        const newApplication = await Application.create({
            job_id: invitation.jobId,
            candidate_id: invitation.candidateId,
            status: 'under_review',
        });
        await newApplication.save();
        // Cập nhật trạng thái lời mời
        invitation.status = 'accepted';
        await invitation.save();
        // Tạo thông báo cho nhà tuyển dụng
        const notificationMessage = `Có một ứng viên chấp nhận lời mời vào công việc "${invitation.jobId.title}".`;
        const notification = new Notification({
            user_id: invitation.recruiterId, // ID của nhà tuyển dụng
            message: notificationMessage,
        });
        await notification.save();

        res.status(200).json({
            message: 'Lời mời đã được chấp nhận, ứng tuyển thành công, và thông báo đã được gửi.',
        });
    } catch (error) {
        console.error('Error accepting invitation:', error.message);
        res.status(500).json({ message: 'Lỗi hệ thống.', error: error.message });
    }
});
// routes/invitation.js
router.post('/reject/:invitationId', async (req, res) => {
    const { invitationId } = req.params;

    try {
        // Tìm thư mời theo invitationId
        const invitation = await Invitation.findById(invitationId).populate('jobId').populate('candidateId');
        
        if (!invitation) {
            return res.status(404).json({ message: 'Thư mời không tìm thấy' });
        }

        // Cập nhật trạng thái thư mời thành 'rejected'
        invitation.status = 'declined';
        await invitation.save();


        // Tạo thông báo cho nhà tuyển dụng
        const notification = new Notification({
            user_id: invitation.recruiterId,
            message: `Một ứng viên đã từ chối thư mời công việc "${invitation.jobId.title}"`,
            read_status: false,
            created_at: new Date()
        });

        // Lưu thông báo
        await notification.save();

        // Trả về phản hồi thành công
        res.status(200).json({ message: 'Thư mời đã bị từ chối và thông báo đã được gửi đến nhà tuyển dụng' });
    } catch (error) {
        console.error('Lỗi khi từ chối thư mời:', error.message);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
});


module.exports = router;  