const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const mongoose = require('mongoose');
const ViewedJob = require('../models/ViewedJob');
const SavedJob = require('../models/SavedJob');
const Invitation = require('../models/Invitation');
const FollowedCompany = require('../models/FollowedCompany');
const Company = require('../models/Company');
const InterviewSchedule = require('../models/InterviewSchedule');
const InterviewInvite = require('../models/Invitation');
// CREATE - Tạo một báo cáo mới
router.post('/', async (req, res) => {
  try {
    const { total_jobs, total_applications, total_users } = req.body;
    const newReport = new Report({ total_jobs, total_applications, total_users });
    await newReport.save();
    res.status(201).json({ message: 'Report created successfully', newReport });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy tất cả báo cáo
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy báo cáo theo ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// UPDATE - Cập nhật một báo cáo
router.put('/:id', async (req, res) => {
  try {
    const { total_jobs, total_applications, total_users } = req.body;
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { total_jobs, total_applications, total_users },
      { new: true }
    );
    if (!updatedReport) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report updated successfully', updatedReport });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE - Xóa một báo cáo
router.delete('/:id', async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/report-statistics/alls', async (req, res) => {
  try {
    // Thống kê người dùng
    const applicantCount = await User.countDocuments({ role: 'applicant' });
    const recruiterCount = await User.countDocuments({ role: 'recruiter' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Thống kê công việc
    const fullTimeCount = await Job.countDocuments({ job_type: 'full_time' });
    const partTimeCount = await Job.countDocuments({ job_type: 'part_time' });
    const internshipCount = await Job.countDocuments({ job_type: 'internship' });

    const { year } = req.query; // Lấy năm từ query params

    const matchStage = {};
    if (year) {
      matchStage.created_at = {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lt: new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`),
      };
    }

    const companyStats = await Company.aggregate([
      {
        $match: matchStage, // Áp dụng bộ lọc theo năm
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' }, // Nhóm theo năm
            month: { $month: '$created_at' }, // Nhóm theo tháng
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, // Sắp xếp theo năm và tháng
    ]);

    // Format dữ liệu trả về
    const companyStatsFormatted = companyStats.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count,
    }));

    // Tạo danh sách hiển thị
    const months = companyStatsFormatted.map(
      (item) => `Tháng ${item.month}/${item.year}`
    );
    const companyCount = companyStatsFormatted.map((item) => item.count);

    res.json({
      users: { applicant: applicantCount, recruiter: recruiterCount, admin: adminCount },
      jobs: { full_time: fullTimeCount, part_time: partTimeCount, internship: internshipCount },
      companies: { months, count: companyCount },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/report-statistics/application/all', async (req, res) => {
  try {
    const { year, companyId } = req.query;
    console.log("id nè", companyId);

    const filter = {};

    // Bộ lọc theo năm
    if (year && year !== 'all') {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
      filter.dateRange = { startDate, endDate };
    }

    // Bộ lọc theo công ty
    const companyJobs = companyId
      ? await Job.find({ company_id: companyId }, '_id')
      : [];
    console.log("id nè", companyJobs);


    // Dữ liệu thống kê
    const [jobsPosted, jobsApplied, totalApplicants] = await Promise.all([
      // Số công việc đã đăng
      Job.aggregate([
        {
          $match: {
            ...(filter.dateRange && {
              created_at: { $gte: filter.dateRange.startDate, $lt: filter.dateRange.endDate },
            }),
            ...(companyId && { company_id: new mongoose.Types.ObjectId(companyId) }), // Sử dụng 'new' với ObjectId

          },
        },
        {
          $project: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
          },
        },
        // Nhóm theo năm-tháng
        {
          $group: {
            _id: { year: "$year", month: "$month" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
        // Nhóm tổng số theo năm
        {
          $group: {
            _id: "$_id.year",
            months: { $push: { month: "$_id.month", count: "$count" } },
            yearTotal: { $sum: "$count" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      // Số công việc được ứng tuyển
      Application.aggregate([
        {
          $match: {
            ...(filter.dateRange && {
              applied_at: { $gte: filter.dateRange.startDate, $lt: filter.dateRange.endDate },
            }),
            ...(companyId && { job_id: { $in: companyJobs.map((job) => job._id) } }),
          },
        },
        {
          $project: {
            year: { $year: "$applied_at" },
            month: { $month: "$applied_at" },
          },
        },
        // Nhóm theo năm-tháng
        {
          $group: {
            _id: { year: "$year", month: "$month" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
        // Nhóm tổng số theo năm
        {
          $group: {
            _id: "$_id.year",
            months: { $push: { month: "$_id.month", count: "$count" } },
            yearTotal: { $sum: "$count" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      // Tổng số người dùng (không quan tâm vai trò)
      User.countDocuments({
        ...(filter.dateRange && {
          created_at: { $gte: filter.dateRange.startDate, $lt: filter.dateRange.endDate },
        }),
      }),
    ]);

    // Trả về kết quả
    res.json({
      jobsPosted,
      jobsApplied,
      totalApplicants,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/reports/overview/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const { range, startDate, endDate } = req.query;

    // Tính toán khoảng thời gian lọc
    let dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      dateFilter = { $gte: start, $lte: end };
    } else if (range === 'week') {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'month') {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Lấy các job thuộc nhà tuyển dụng
    const jobs = await Job.find({ employer_id: employerId });
    const jobIds = jobs.map(j => j._id);

    // Lọc các ứng tuyển theo khoảng thời gian nếu có
    const applicationQuery = { job_id: { $in: jobIds } };
    if (Object.keys(dateFilter).length > 0) {
      applicationQuery.applied_at = dateFilter;
    }
    const interviewQuery = { job_id: { $in: jobIds } };
    if (Object.keys(dateFilter).length > 0) {
      interviewQuery.created_at = dateFilter;
    }
    const applications = await Application.find(applicationQuery);
    const interviewer = await InterviewSchedule.find(interviewQuery);
    const applied = applications.length;
    const processing = interviewer.filter(a => a.status === 'Chờ phê duyệt').length;
    const hired = applications.filter(a => a.status === 'được tuyển dụng').length;
    const internship = interviewer.filter(a => a.status === 'Đã phỏng vấn').length;
    const rejected = interviewer.filter(a => a.status === 'Hủy').length;

    const openJobs = jobs.filter(j => j.status === 'open');
    const openCount = openJobs.length;

    const conversionRate = applied === 0 ? 0 : ((hired / applied) * 100).toFixed(1);

    // Lọc openJobs theo range thời gian
    let filteredOpenJobs = openJobs;
    if (Object.keys(dateFilter).length > 0) {
      filteredOpenJobs = openJobs.filter(job => {
        const createdAt = new Date(job.created_at);
        return createdAt >= dateFilter.$gte && createdAt <= dateFilter.$lte;
      });
    }

    const longestOpenJob = filteredOpenJobs.reduce((longest, job) => {
      const daysOpen = (Date.now() - new Date(job.created_at)) / (1000 * 3600 * 24);
      if (!longest || daysOpen > longest.days) {
        return { title: job.title, days: Math.floor(daysOpen) };
      }
      return longest;
    }, null);


    const effectiveJob = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          status: 'đã nộp',
        }
      },
      { $group: { _id: "$job_id", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $match: { "job.status": "open" } },
      { $unwind: "$job" },
      { $project: { title: "$job.title", count: 1 } }
    ]);
    const savedUserIds = await SavedJob.distinct("user_id", { job_id: { $in: jobIds } });
    const viewedUserIds = await ViewedJob.distinct("user_id", { job_id: { $in: jobIds } });
    const appliedUserIds = await Application.distinct("candidate_id", applicationQuery);
    const viewCount = await ViewedJob.countDocuments({ job_id: { $in: jobIds }, ...(dateFilter.$gte && { created_at: dateFilter }) });
    const saveCount = await SavedJob.countDocuments({ job_id: { $in: jobIds }, ...(dateFilter.$gte && { created_at: dateFilter }) });
    const inviteCount = await Invitation.countDocuments({ jobId: { $in: jobIds }, ...(dateFilter.$gte && { created_at: dateFilter }) });
    const savedIdsStr = savedUserIds.map(id => id.toString());
    const viewedIdsStr = viewedUserIds.map(id => id.toString());
    const appliedIdsStr = appliedUserIds.map(id => id.toString());

    console.log("appliedUserIds:", appliedIdsStr);
    console.log("savedUserIds:", savedIdsStr);
    console.log("viewedUserIds:", viewedIdsStr);

    const savedToApplied = savedIdsStr.length === 0 ? 0 :
      ((appliedIdsStr.filter(id => savedIdsStr.includes(id)).length / savedIdsStr.length) * 100).toFixed(1);

    const viewedToApplied = viewedIdsStr.length === 0 ? 0 :
      ((appliedIdsStr.filter(id => viewedIdsStr.includes(id)).length / viewedIdsStr.length) * 100).toFixed(1);

    console.log("Tỉ lệ từ saved sang applied: ", savedToApplied, '%');
    console.log("Tỉ lệ từ viewed sang applied: ", viewedToApplied, '%');
    // Lấy công ty thuộc employerId
    const company = await Company.findOne({ user_id: employerId });
    let followers = 0;
    if (company) {
      const followerQuery = { company_id: company._id };
      if (Object.keys(dateFilter).length > 0) {
        followerQuery.created_at = dateFilter; // ví dụ: { $gte: start, $lte: end }
      }
      followers = await FollowedCompany.countDocuments(followerQuery);
    }

    res.json({
      applied,
      processing,
      hired,
      rejected,
      openCount,
      conversionRate,
      longestOpenJob: longestOpenJob ? `${longestOpenJob.title} (${longestOpenJob.days} ngày)` : null,
      effectiveJob: effectiveJob[0]?.title || null,
      viewCount,
      saveCount,
      inviteCount,
      savedToApplied,
      viewedToApplied,
      internship,
      followers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu báo cáo tổng quan" });
  }
});

router.get('/position/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const { range, startDate, endDate } = req.query;

    console.log(">>> Nhận yêu cầu thống kê vị trí");
    console.log("employerId:", employerId);
    console.log("range:", range, "| startDate:", startDate, "| endDate:", endDate);

    // Xử lý date filter
    let dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      dateFilter = { $gte: start, $lte: end };
    } else if (range === 'week') {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'month') {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    console.log("Date filter được áp dụng:", dateFilter);

    const company = await Company.findOne({ user_id: employerId });
    if (!company) {
      console.log("Không tìm thấy công ty cho user:", employerId);
      return res.status(404).json({ success: false, error: 'Không tìm thấy công ty' });
    }

    const company_id = company._id;
    console.log("Company ID:", company_id);

    const jobs = await Job.find({
      company_id,
      created_at: {
        $gte: startDate,
        $lte: endDate
      }
    });

    console.log("Tìm thấy", jobs.length, "công việc");

    const jobMap = {};
    const jobIds = jobs.map(job => {
      jobMap[job._id.toString()] = job.title;
      return job._id;
    });

    const conditions = { job_id: { $in: jobIds } };
    if (Object.keys(dateFilter).length > 0) {
      conditions.created_at = dateFilter;
    }

    const interviewConditions = {
      job_id: { $in: jobIds },
      status: { $ne: 'cancle' } // Loại bỏ các trạng thái cancle
    };
    if (Object.keys(dateFilter).length > 0) {
      interviewConditions.created_at = dateFilter;
    }

    const applicationConditions = { job_id: { $in: jobIds } };
    if (Object.keys(dateFilter).length > 0) {
      applicationConditions.applied_at = dateFilter;
    }

    console.log("Interview conditions:", interviewConditions);
    console.log("Application conditions:", applicationConditions);

    const applications = await Application.find(applicationConditions);
    const interviews = await InterviewSchedule.find(interviewConditions);
    console.log("Raw interviews data:", interviews);

    const invites = await InterviewInvite.find(conditions);
    const views = await ViewedJob.find(conditions);
    const saves = await SavedJob.find(conditions);

    console.log("Số lượng ứng tuyển:", applications.length);
    console.log("Số lịch phỏng vấn:", interviews.length);
    console.log("Số lời mời:", invites.length);
    console.log("Số lượt xem:", views.length);
    console.log("Số lượt lưu:", saves.length);

    const stats = {};
    jobs.forEach(job => {
      stats[job.title] = {
        title: job.title,
        total: 0,
        processing: 0,
        interviewed: 0,
        hired: 0,
        rejected: 0,
        invited: 0,
        avgTime: 0,
        viewCount: 0,
        saveCount: 0,
        applyRate: '0%',
        hireRate: '0%',
        interviewToHireRate: '0%',
        status: job.status || 'open',
        application_deadline: job.application_deadline || 'N/A',
        totalTime: 0
      };
    });

    // Cập nhật số lượt xem và lưu
    views.forEach(view => {
      const jobTitle = jobMap[view.job_id.toString()];
      if (stats[jobTitle]) {
        stats[jobTitle].viewCount += 1;
      }
    });

    saves.forEach(save => {
      const jobTitle = jobMap[save.job_id.toString()];
      if (stats[jobTitle]) {
        stats[jobTitle].saveCount += 1;
      }
    });

    // Cập nhật số lời mời
    invites.forEach(invite => {
      const jobTitle = jobMap[invite.job_id.toString()];
      if (stats[jobTitle]) {
        stats[jobTitle].invited += 1;
      }
    });

    // Cập nhật thông tin ứng tuyển và phỏng vấn
    applications.forEach(app => {
      const jobTitle = jobMap[app.job_id.toString()];
      if (!stats[jobTitle]) return;

      stats[jobTitle].total += 1;

      // Cập nhật trạng thái dựa trên status của application
      if (app.status === 'đang xử lý') stats[jobTitle].processing += 1;
      if (app.status === 'đã phỏng vấn') stats[jobTitle].interviewed += 1;
      if (app.status === 'được tuyển dụng') stats[jobTitle].hired += 1;
      if (app.status === 'đã từ chối') stats[jobTitle].rejected += 1;

      // Tìm interview liên quan
      const relatedInterview = interviews.find(i => {
        const matchJob = i.job_id?.toString() === app.job_id?.toString();
        const matchCandidate = i.candidate_id?.toString() === app.candidate_id?.toString();
        return matchJob && matchCandidate;
      });

      // Tính thời gian từ khi ứng tuyển đến khi phỏng vấn
      if (relatedInterview && app.applied_at) {
        const interviewDate = new Date(relatedInterview.start_time);
        const appliedDate = new Date(app.applied_at);
        const days = Math.ceil((interviewDate - appliedDate) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          stats[jobTitle].totalTime += days;
          stats[jobTitle].interviewed += 1;
          console.log(`Thời gian xử lý cho ${jobTitle}: ${days} ngày`);
        }
      }
    });

    // Tính toán các tỷ lệ và thời gian trung bình
    Object.values(stats).forEach(item => {
      if (item.interviewed > 0) {
        const avg = Math.ceil(item.totalTime / item.interviewed);
        item.avgTime = `${avg} ngày`;
      }
      if (item.viewCount > 0) {
        item.applyRate = `${Math.round((item.total / item.viewCount) * 100)}%`;
      }
      if (item.interviewed > 0) {
        item.hireRate = `${Math.round((item.hired / item.interviewed) * 100)}%`;
        item.interviewToHireRate = `${Math.round((item.hired / item.interviewed) * 100)}%`;
      }
    });


    const result = Object.values(stats).map(item => ({
      title: item.title,
      total: item.total,
      processing: item.processing,
      interviewed: item.interviewed,
      hired: item.hired,
      rejected: item.rejected,
      invited: item.invited,
      avgTime: item.avgTime,
      viewCount: item.viewCount,
      saveCount: item.saveCount,
      applyRate: item.applyRate,
      hireRate: item.hireRate,
      interviewToHireRate: item.interviewToHireRate,
      status: item.status,
      application_deadline: item.application_deadline ? new Date(item.application_deadline).toLocaleDateString('vi-VN') : 'N/A'
    }));

    console.log("Kết quả thống kê:", result);

    res.json({ success: true, positions: result });
  } catch (err) {
    console.error("Lỗi máy chủ:", err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// Thống kê theo nguồn tuyển
router.get('/source/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const { range, startDate, endDate } = req.query;

    // Xử lý date filter
    let dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      dateFilter = { $gte: start, $lte: end };
    } else if (range === 'week') {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'month') {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Lấy các job thuộc nhà tuyển dụng
    const jobs = await Job.find({ employer_id: employerId });
    const jobIds = jobs.map(j => j._id);

    // Thống kê theo nguồn
    const sourceStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $group: {
          _id: "$source",
          total: { $sum: 1 },
          hired: {
            $sum: {
              $cond: [{ $eq: ["$status", "được tuyển dụng"] }, 1, 0]
            }
          },
          interviewed: {
            $sum: {
              $cond: [{ $eq: ["$status", "đã phỏng vấn"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          source: "$_id",
          total: 1,
          hired: 1,
          interviewed: 1,
          hireRate: {
            $multiply: [
              { $divide: ["$hired", { $max: ["$total", 1] }] },
              100
            ]
          },
          interviewRate: {
            $multiply: [
              { $divide: ["$interviewed", { $max: ["$total", 1] }] },
              100
            ]
          }
        }
      }
    ]);

    // Thống kê theo thời gian
    const timeStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$applied_at" },
            month: { $month: "$applied_at" },
            source: "$source"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.json({
      success: true,
      sourceStats: sourceStats.map(stat => ({
        ...stat,
        hireRate: `${Math.round(stat.hireRate)}%`,
        interviewRate: `${Math.round(stat.interviewRate)}%`
      })),
      timeStats
    });
  } catch (err) {
    console.error("Lỗi máy chủ:", err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// Thống kê theo quy trình tuyển dụng
router.get('/process/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const { range, startDate, endDate } = req.query;

    // Xử lý date filter
    let dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      dateFilter = { $gte: start, $lte: end };
    } else if (range === 'week') {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'month') {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Lấy các job thuộc nhà tuyển dụng
    const jobs = await Job.find({ employer_id: employerId });
    const jobIds = jobs.map(j => j._id);

    // Thống kê thời gian trung bình cho mỗi giai đoạn
    const stageTimeStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $lookup: {
          from: 'interviewschedules',
          localField: '_id',
          foreignField: 'application_id',
          as: 'interview'
        }
      },
      {
        $project: {
          job_id: 1,
          status: 1,
          applied_at: 1,
          interview_date: { $arrayElemAt: ['$interview.start_time', 0] },
          processing_time: {
            $cond: [
              { $eq: ['$status', 'đã phỏng vấn'] },
              {
                $divide: [
                  { $subtract: [{ $arrayElemAt: ['$interview.start_time', 0] }, '$applied_at'] },
                  1000 * 60 * 60 * 24 // Chuyển đổi từ milliseconds sang ngày
                ]
              },
              null
            ]
          }
        }
      },
      {
        $group: {
          _id: '$status',
          avgTime: { $avg: '$processing_time' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Thống kê tỷ lệ chuyển đổi giữa các giai đoạn
    const conversionStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Thống kê hiệu suất người phỏng vấn
    const interviewerStats = await InterviewSchedule.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
        }
      },
      {
        $group: {
          _id: '$interviewer_id',
          totalInterviews: { $sum: 1 },
          completedInterviews: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Đã phỏng vấn'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'interviewer'
        }
      },
      {
        $project: {
          interviewerName: { $arrayElemAt: ['$interviewer.username', 0] },
          totalInterviews: 1,
          completedInterviews: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedInterviews', { $max: ['$totalInterviews', 1] }] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      stageTimeStats: stageTimeStats.map(stat => ({
        ...stat,
        avgTime: stat.avgTime ? `${Math.round(stat.avgTime)} ngày` : 'N/A'
      })),
      conversionStats,
      interviewerStats: interviewerStats.map(stat => ({
        ...stat,
        completionRate: `${Math.round(stat.completionRate)}%`
      }))
    });
  } catch (err) {
    console.error("Lỗi máy chủ:", err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// Thống kê đa dạng
router.get('/diversity/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const { range, startDate, endDate } = req.query;

    // Xử lý date filter
    let dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      dateFilter = { $gte: start, $lte: end };
    } else if (range === 'week') {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'month') {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Lấy các job thuộc nhà tuyển dụng
    const jobs = await Job.find({ employer_id: employerId });
    const jobIds = jobs.map(j => j._id);

    // Thống kê giới tính
    const genderStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'candidate_id',
          foreignField: 'user_id',
          as: 'profile'
        }
      },
      {
        $unwind: '$profile'
      },
      {
        $group: {
          _id: '$profile.gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Thống kê độ tuổi
    const ageStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'candidate_id',
          foreignField: 'user_id',
          as: 'profile'
        }
      },
      {
        $unwind: '$profile'
      },
      {
        $project: {
          age: {
            $divide: [
              {
                $subtract: [
                  new Date(),
                  {
                    $cond: {
                      if: { $eq: [{ $type: '$profile.date_of_birth' }, 'string'] },
                      then: { $dateFromString: { dateString: '$profile.date_of_birth' } },
                      else: '$profile.date_of_birth'
                    }
                  }
                ]
              },
              365 * 24 * 60 * 60 * 1000
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 25] }, then: 'Dưới 25' },
                { case: { $lt: ['$age', 35] }, then: '25-35' },
                { case: { $lt: ['$age', 45] }, then: '35-45' },
                { case: { $lt: ['$age', 55] }, then: '45-55' }
              ],
              default: 'Trên 55'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Thống kê học vấn
    const educationStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'candidate_id',
          foreignField: 'user_id',
          as: 'profile'
        }
      },
      { $unwind: '$profile' },
      {
        $group: {
          _id: '$profile.education',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          stats: { $push: { _id: '$_id', count: '$count' } },
          total: { $sum: '$count' }
        }
      },
      {
        $unwind: '$stats'
      },
      {
        $project: {
          _id: '$stats._id',
          count: '$stats.count',
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$stats.count', '$total'] }, 100] },
              1
            ]
          }
        }
      }
    ]);

    // Thống kê kinh nghiệm
    const experienceStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'candidate_id',
          foreignField: 'user_id',
          as: 'profile'
        }
      },
      {
        $unwind: '$profile'
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$profile.years_of_experience', 1] }, then: 'Dưới 1 năm' },
                { case: { $lt: ['$profile.years_of_experience', 3] }, then: '1-3 năm' },
                { case: { $lt: ['$profile.years_of_experience', 5] }, then: '3-5 năm' },
                { case: { $lt: ['$profile.years_of_experience', 7] }, then: '5-7 năm' },
                { case: { $lt: ['$profile.years_of_experience', 10] }, then: '7-10 năm' }
              ],
              default: 'Trên 10 năm'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      genderStats,
      ageStats,
      educationStats,
      experienceStats
    });
  } catch (err) {
    console.error("Lỗi máy chủ:", err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// Thống kê chất lượng
router.get('/quality/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const { range, startDate, endDate } = req.query;

    // Xử lý date filter
    let dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      dateFilter = { $gte: start, $lte: end };
    } else if (range === 'week') {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'month') {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Lấy các job thuộc nhà tuyển dụng
    const jobs = await Job.find({ employer_id: employerId });
    const jobIds = jobs.map(j => j._id);

    // Thống kê kỹ năng
    const skillStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'candidate_id',
          foreignField: 'user_id',
          as: 'profile'
        }
      },
      {
        $unwind: '$profile'
      },
      {
        $unwind: '$profile.skills'
      },
      {
        $group: {
          _id: '$profile.skills',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Thống kê đánh giá phỏng vấn
    const interviewStats = await InterviewSchedule.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
        }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'interviewer_id',
          foreignField: 'user_id',
          as: 'interviewer'
        }
      },
      {
        $unwind: '$interviewer'
      },
      {
        $group: {
          _id: {
            interviewer: '$interviewer.first_name',
            criteria: '$evaluation_criteria'
          },
          avgScore: { $avg: '$evaluation_score' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.criteria',
          interviewers: {
            $push: {
              name: '$_id.interviewer',
              avgScore: { $round: ['$avgScore', 2] },
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      }
    ]);

    // Thống kê phản hồi
    const feedbackStats = await InterviewSchedule.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
        }
      },
      {
        $group: {
          _id: '$feedback',
          count: { $sum: 1 }
        }
      }
    ]);

    // Thống kê tỷ lệ giữ chân
    const retentionStats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          status: 'được tuyển dụng',
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'candidate_id',
          foreignField: 'user_id',
          as: 'profile'
        }
      },
      {
        $unwind: '$profile'
      },
      {
        $group: {
          _id: {
            year: { $year: '$applied_at' },
            month: { $month: '$applied_at' }
          },
          hired: { $sum: 1 },
          stillActive: {
            $sum: {
              $cond: [
                { $eq: ['$profile.state', 'approved'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          rate: {
            $multiply: [
              { $divide: ['$stillActive', { $max: ['$hired', 1] }] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      skillStats,
      interviewStats,
      feedbackStats,
      retentionStats
    });
  } catch (err) {
    console.error("Lỗi máy chủ:", err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// Thống kê xu hướng
router.get('/trend/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const { range, startDate, endDate } = req.query;

    // Xử lý date filter
    let dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      dateFilter = { $gte: start, $lte: end };
    } else if (range === 'week') {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'month') {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      dateFilter = { $gte: start, $lte: new Date() };
    } else if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Lấy các job thuộc nhà tuyển dụng
    const jobs = await Job.find({ employer_id: employerId });
    const jobIds = jobs.map(j => j._id);

    // Xu hướng ứng tuyển
    const applicationTrends = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$applied_at' },
            month: { $month: '$applied_at' },
            day: { $dayOfMonth: '$applied_at' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.day' },
              '/',
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          count: 1
        }
      }
    ]);

    // Xu hướng phỏng vấn
    const interviewTrends = await InterviewSchedule.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' },
            day: { $dayOfMonth: '$created_at' }
          },
          scheduled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Đã lên lịch'] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Đã phỏng vấn'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.day' },
              '/',
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          scheduled: 1,
          completed: 1
        }
      }
    ]);

    // Xu hướng tuyển dụng
    const hiringTrends = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$applied_at' },
            month: { $month: '$applied_at' },
            day: { $dayOfMonth: '$applied_at' }
          },
          hired: {
            $sum: {
              $cond: [{ $eq: ['$status', 'được tuyển dụng'] }, 1, 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$status', 'đã từ chối'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.day' },
              '/',
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          hired: 1,
          rejected: 1
        }
      }
    ]);

    // Xu hướng nguồn tuyển
    const sourceTrends = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          ...(Object.keys(dateFilter).length > 0 && { applied_at: dateFilter })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$applied_at' },
            month: { $month: '$applied_at' },
            day: { $dayOfMonth: '$applied_at' },
            source: '$source'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          },
          sources: {
            $push: {
              source: '$_id.source',
              count: '$count'
            }
          }
        }
      },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.day' },
              '/',
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          sources: 1
        }
      },
      {
        $project: {
          period: 1,
          ...Object.fromEntries(
            ['HirePoint', 'LinkedIn', 'Facebook', 'Other'].map(source => [
              source,
              {
                $let: {
                  vars: {
                    sourceData: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$sources',
                            as: 's',
                            cond: { $eq: ['$$s.source', source] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: { $ifNull: ['$$sourceData.count', 0] }
                }
              }
            ])
          )
        }
      }
    ]);

    res.json({
      success: true,
      applicationTrends,
      interviewTrends,
      hiringTrends,
      sourceTrends
    });
  } catch (err) {
    console.error("Lỗi máy chủ:", err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

module.exports = router;
