const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Moderation = require('../models/Moderation');
const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Cập nhật trạng thái công việc
router.put('/:jobId/status', async (req, res) => {
    try {
        const { status, reason, admin_id } = req.body;
        const validStatuses = ['pending', 'approved', 'rejected', 'reported'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        // Kiểm tra jobId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
            return res.status(400).json({ message: 'ID công việc không hợp lệ' });
        }
        const jobId = new mongoose.Types.ObjectId(req.params.jobId);

        // Tìm công việc theo ID
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy công việc' });
        }

        // Tìm kiểm duyệt công việc
        let moderation = await Moderation.findOne({ job_id: jobId });
        if (!moderation) {
            return res.status(404).json({ message: 'Không tìm thấy kiểm duyệt cho công việc này' });
        }

        // Cập nhật trạng thái và lý do từ chối (nếu có)
        moderation.status = status;
        moderation.admin_id= admin_id;
        if (status === 'rejected' && reason) {
            moderation.reason = reason;

            // Tạo thông báo cho nhà tuyển dụng
            const notification = new Notification({
                user_id: job.employer_id, // Người nhận thông báo là chủ tin tuyển dụng
                title: 'Công việc của bạn đã bị từ chối',
                message: `Công việc "${job.title}" đã bị từ chối. Lý do: ${reason}`,
            });

            await notification.save();
        }
        if (status === 'approved' && reason) {
          
            // Tạo thông báo cho nhà tuyển dụng
            const notification = new Notification({
                user_id: job.employer_id, // Người nhận thông báo là chủ tin tuyển dụng
                title: 'Công việc của bạn đã được chấp nhận',
                message: `Công việc "${job.title}" đã được chấp nhận và hiển thị trên hệ thống.`,
            });

            await notification.save();
        }

        await moderation.save();
        res.json({ message: 'Cập nhật trạng thái thành công', moderation });

    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


router.put('/:jobId/report', async (req, res) => {
    try {
        const { user_id, reason } = req.body;
        const { jobId } = req.params;

        // Kiểm tra jobId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'ID công việc không hợp lệ' });
        }

        const jobObjectId = new mongoose.Types.ObjectId(jobId);
        const userObjectId = new mongoose.Types.ObjectId(user_id);

        // Tìm bản ghi kiểm duyệt của jobId
        let moderation = await Moderation.findOne({ job_id: jobObjectId });

        if (!moderation) {
            moderation = new Moderation({
                job_id: jobObjectId,
                status: "reported",
                reports: [{ user_id: userObjectId, reason }]
            });

            await moderation.save();
            return res.json({ message: 'Báo cáo đã được tạo mới', moderation });
        }
        // Kiểm tra xem người dùng đã báo cáo chưa
        const existingReport = moderation.reports.find(report => report.user_id.equals(userObjectId));

        if (existingReport) {
            existingReport.reason = reason;
            existingReport.reported_at = new Date();
        } else {
            moderation.reports.push({ user_id: userObjectId, reason });
        }

        // Cập nhật trạng thái thành "reported"
        moderation.status = "reported";

        await moderation.save();

        res.json({ message: 'Báo cáo đã được ghi nhận', moderation });

    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// thông tin toàn bộ công việc bị báo cáo
router.get("/reports", async (req, res) => {
    try {
        const reports = await Moderation.find({ status: "reported" })
            .populate({
                path: "job_id",
                select: "title company_id",
                populate: { path: "company_id", select: "company_name" } // Lấy luôn thông tin công ty
            })
            .populate("reports.user_id", "username email");



        const reportList = reports.map((report) => ({
            job_id: report.job_id?._id,
            job_title: report.job_id?.title || "Chưa xác định",
            company_name: report.job_id?.company_id?.company_name || "Không xác định", // Lấy trực tiếp từ populate
            total_reports: report.reports.length,
            reports: report.reports.map((r) => ({
                user_id: r.user_id?._id,
                user_name: r.user_id?.username,
                user_email: r.user_id?.email,
                reason: r.reason,
                reported_at: r.reported_at,
            })),
            status: report.status,
        }));

        res.json(reportList);
    } catch (error) {
        console.error("Lỗi khi lấy báo cáo:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// lấy thông 1 công việc bị báo cáo 
router.get('/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'ID công việc không hợp lệ' });
        }

        // Tìm báo cáo dựa trên job_id
        const moderation = await Moderation.findOne({ job_id: jobId, status: "reported" })
            .populate({
                path: "job_id",
                select: "title company_id",
                populate: { path: "company_id", select: "company_name" } // Lấy thông tin công ty
            })
            .populate("reports.user_id", "username email");

        if (!moderation) {
            return res.status(404).json({ message: 'Không tìm thấy báo cáo nào cho công việc này' });
        }

        // Lấy thông tin công việc
        const job = await Job.findById(jobId).populate('company_id', 'company_name');

        // Định dạng dữ liệu trả về
        const responseData = {
            job_id: job._id,
            job_title: job.title,
            company_id: job.company_id._id,
            company_name: job.company_id.company_name,
            total_reports: moderation.reports.length,
            status: moderation.status,
            reports: moderation.reports.map(report => ({
                user_id: report.user_id._id,
                user_name: report.user_id.username,
                user_email: report.user_id?.email,
                reason: report.reason,
                reported_at: report.reported_at
            })),
            admin_id: moderation.admin_id || null,
            moderation_reason: moderation.reason || null,
            created_at: moderation.created_at
        };

        res.json(responseData);
    } catch (error) {
        console.error('Lỗi lấy báo cáo:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


module.exports = router;
