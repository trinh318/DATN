const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Review = require("../models/ReviewSchema");
const Company = require("../models/Company");
const ViewedJob = require('../models/ViewedJob');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Follow = require('../models/FollowedCompany');
const Interview = require('../models/InterviewSchedule');

// Tạo đánh giá mới
router.post("/", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ message: "Error creating review", error: err.message });
  }
});

// Lấy danh sách đánh giá của một công ty
router.get("/company/:companyId", async (req, res) => {
  try {
    const reviews = await Review.find({
      company_id: req.params.companyId,
      status: "approved",
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews", error: err.message });
  }
});

// Thống kê đánh giá công ty
router.get("/company/:companyId/statistics", async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { company_id: new mongoose.Types.ObjectId(req.params.companyId), status: "approved" } },
      {
        $group: {
          _id: "$company_id",
          avgRating: { $avg: "$rating" },
          salary: { $avg: "$details.salary_benefits" },
          training: { $avg: "$details.training" },
          management: { $avg: "$details.management" },
          culture: { $avg: "$details.culture" },
          workspace: { $avg: "$details.workspace" },
        },
      },
    ]);
    res.json(stats[0] || {});
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
});

// Lấy danh sách đánh giá theo user_id (gửi user_id từ frontend)
router.get("/user/:userId", async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.params.userId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user reviews", error: err.message });
  }
});
// Lấy toàn bộ đánh giá
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find(); // Lấy tất cả
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đánh giá", error: err.message });
  }
});

// Sửa đánh giá
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user_id.toString() !== updatedData.user_id) return res.status(403).json({ message: "Unauthorized" });
    if (review.status !== "pending") return res.status(400).json({ message: "Cannot edit approved/rejected review" });

    // Cập nhật nội dung
    review.rating = updatedData.rating || review.rating;
    review.comment = updatedData.comment || review.comment;
    review.recommend = updatedData.recommend !== undefined ? updatedData.recommend : review.recommend;
    review.details = updatedData.details || review.details;

    const updated = await review.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Error updating review", error: error.message });
  }
});

// Xoá đánh giá
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Kiểm tra quyền xóa (user_id phải trùng)
    if (review.user_id.toString() !== req.body.user_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
});

// Thêm phản hồi của nhà tuyển dụng
router.post("/:id/response", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.responses.push({
      user_id: req.body.user_id,
      comment: req.body.comment,
    });

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Error adding response", error: error.message });
  }
});


router.put("/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    // Kiểm tra xem đánh giá có tồn tại không
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    // Cập nhật trạng thái
    review.status = status;
    await review.save();

    res.json({ message: "Cập nhật trạng thái thành công", review });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
  }
});

// Route lấy dữ liệu tổng hợp đánh giá của công ty theo user đăng nhập
router.get('/company-review-report', async (req, res) => {
  try {
    const userId = req.query.userId;

    // Tìm công ty theo user_id
    const company = await Company.findOne({ user_id: userId });
    if (!company) {
      return res.status(404).json({ message: 'Không tìm thấy công ty.' });
    }

    const companyId = company._id;

    // Lấy các đánh giá đã được duyệt
    const reviews = await Review.find({ company_id: companyId, status: 'approved' });

    if (!reviews.length) {
      return res.json({
        totalRating: 0,
        avgRating: 0,
        recommendStats: { true: 0, false: 0 },
        overtimeStats: { satisfied: 0, unsatisfied: 0 },
        detailStats: {
          salary_benefits: 0,
          training: 0,
          management: 0,
          culture: 0,
          workspace: 0,
        },
        comments: [],
      });
    }

    // Khởi tạo thống kê
    let ratingSum = 0;
    let recommendTrue = 0;
    let recommendFalse = 0;
    let overtimeSatisfied = 0;
    let overtimeUnsatisfied = 0;
    let detailStats = {
      salary_benefits: 0,
      training: 0,
      management: 0,
      culture: 0,
      workspace: 0,
    };
    const comments = [];

    reviews.forEach((review) => {
      ratingSum += review.rating;

      // Recommend 
      if (review.recommend) recommendTrue++;
      else recommendFalse++;

      // Overtime
      if (review.overtime_feeling === 'satisfied') overtimeSatisfied++;
      else if (review.overtime_feeling === 'unsatisfied') overtimeUnsatisfied++;

      // Detail stats
      if (review.details) {
        Object.keys(detailStats).forEach(key => {
          if (review.details[key]) {
            detailStats[key] += review.details[key];
          }
        });
      }

      // Comments
      comments.push({
        user: review.anonymous ? 'Ẩn danh' : review.user_id,
        comment: review.comment,
        suggestion: review.suggestion,
        what_i_love: review.what_i_love,
        overtime_feeling: review.overtime_feeling,
        recommend: review.recommend,
        overtime_reason: review.overtime_reason,
        salary_benefits: review.details.salary_benefits,
        training: review.details.training,
        management: review.details.management,
        culture: review.details.culture,
        workspace: review.details.workspace
      });
    });

    // Tính trung bình cho điểm chi tiết
    Object.keys(detailStats).forEach(key => {
      detailStats[key] = Number((detailStats[key] / reviews.length).toFixed(1));
    });

    const avgRating = Number((ratingSum / reviews.length).toFixed(1));

    res.json({
      totalRating: reviews.length,
      avgRating,
      recommendStats: { true: recommendTrue, false: recommendFalse },
      overtimeStats: { satisfied: overtimeSatisfied, unsatisfied: overtimeUnsatisfied },
      detailStats,
      comments,
    });
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu đánh giá công ty:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});
router.get('/monthly-views', async (req, res) => {
  try {
    const employerId = req.query.userId;

    if (!employerId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // Lấy tất cả job do employer tạo
    const jobs = await Job.find({ employer_id: employerId }, '_id');
    const jobIds = jobs.map(job => job._id);

    // Thống kê số lượt xem theo tháng
    const stats = await ViewedJob.aggregate([
      {
        $match: {
          job_id: { $in: jobIds }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" }
          },
          views: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const result = stats.map(entry => ({
      month: `${entry._id.month}/${entry._id.year}`,
      views: entry.views
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Lỗi lấy lượt xem theo tháng:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi server." });
  }
});
router.get('/monthly-applications', async (req, res) => {
  try {
    const employerId = req.query.userId;

    if (!employerId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // Lấy tất cả job của employer này
    const jobs = await Job.find({ employer_id: employerId }, '_id');
    const jobIds = jobs.map(job => job._id);

    // Lấy ứng tuyển theo tháng
    const stats = await Application.aggregate([
      {
        $match: {
          job_id: { $in: jobIds }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$applied_at" },
            month: { $month: "$applied_at" }
          },
          applications: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const result = stats.map(entry => ({
      month: `${entry._id.month}/${entry._id.year}`,
      applications: entry.applications
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Lỗi lấy ứng tuyển theo tháng:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi server." });
  }
});
router.get('/monthly-followers', async (req, res) => {
  const userId = req.query.userId;

  try {
    // Tìm company_id theo userId của nhà tuyển dụng
    const company = await Company.findOne({ user_id: userId });
    console.log("thong tin congty laf", company);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const followers = await Follow.aggregate([
      {
        $match: {
          company_id: company._id
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          followers: '$count',
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);

    res.json(followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy số lượng follower hàng tháng" });
  }
});
router.get('/monthly-interviews', async (req, res) => {
  try {
    const userId = req.query.userId;

    // Tìm company_id theo userId
    const company = await Company.findOne({ user_id: userId });
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Tìm tất cả các job của công ty này
    const jobs = await Job.find({ company_id: company._id }, { _id: 1 });
    const jobIds = jobs.map(job => job._id);

    // Đếm phỏng vấn theo tháng với trạng thái hợp lệ và job thuộc công ty
    const interviews = await Interview.aggregate([
      {
        $match: {
          job_id: { $in: jobIds },
          status: { $in: ['Đang đợi phỏng vấn', 'Đã phỏng vấn'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          interviews: '$count',
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);

    res.json(interviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy số lượng phỏng vấn hàng tháng" });
  }
});


// Lấy chi tiết 1 đánh giá và thông tin công ty
router.get("/:reviewId", async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)
      .populate("company_id"); // lấy thêm thông tin công ty

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết đánh giá",
      error: err.message,
    });
  }
});

const calculateRatingPercentage = (reviews, category) => {
  const starCount = [0, 0, 0, 0, 0]; // [1 sao, 2 sao, 3 sao, 4 sao, 5 sao]
  let validCount = 0;

  console.log(`→ [DEBUG] Đang tính phần trăm cho category: ${category}`);
  console.log(`→ [DEBUG] Tổng số review truyền vào: ${reviews.length}`);

  if (!category || reviews.length === 0) {
    console.log("→ [DEBUG] Không có category hoặc danh sách review trống.");
    return { percentages: [0, 0, 0, 0, 0], totalReviews: 0 };
  }

  reviews.forEach((review, index) => {
    let rating;
    if (category === 'rating') {
      rating = review[category];
    } else {
      rating = review.details ? review.details[category] : undefined;
    }
    console.log(`   [${index}] rating: ${rating}`);
    if (rating >= 1 && rating <= 5) {
      starCount[rating - 1]++;
      validCount++;
    }
  });

  console.log(`→ [DEBUG] Số lượng đánh giá hợp lệ: ${validCount}`);
  console.log(`→ [DEBUG] Số lượng từng sao:`, starCount);

  const percentages = validCount > 0
    ? starCount.map((count) => ((count / validCount) * 100).toFixed(2))
    : [0, 0, 0, 0, 0];
    console.log(`→ [DEBUG] Số lượng từng sao:`, percentages);
  return {
    percentages,
    totalReviews: validCount
  };
};
const calculateAverageScore = (reviews, category) => {
  const validScores = reviews
    .map((review) => review.details?.[category])
    .filter((score) => score >= 1 && score <= 5);

  const total = validScores.reduce((sum, score) => sum + score, 0);
  const average = validScores.length > 0 ? (total / validScores.length).toFixed(2) : "0.00";

  return average;
};
router.get('/company/:companyId/review-stats', async (req, res) => {
  try {
    const { companyId } = req.params;

    // Lấy tất cả các đánh giá của công ty
    const reviews = await Review.find({ company_id: companyId }).lean();

  

    console.log("Dữ liệu đánh giá:", reviews);

    // Tính toán đánh giá trung bình tổng thể
    const validReviews = reviews.filter((review) => review.rating >= 1 && review.rating <= 5);
    const totalRating = validReviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = (totalRating / validReviews.length).toFixed(2);

    const ratingPercentage = validReviews.length > 0
      ? ((totalRating / (validReviews.length * 5)) * 100).toFixed(2)
      : "0.00";

    // Tính phần trăm phân phối sao tổng thể
    const ratingDistribution = calculateRatingPercentage(reviews, 'rating');

    // Tính phần trăm và điểm trung bình cho từng lĩnh vực chi tiết
    const detailCategories = ['salary_benefits', 'training', 'management', 'culture', 'workspace'];
    const detailsPercentage = {};
    const detailAverageScores = {};

    detailCategories.forEach((category) => {
      const validDetailsReviews = reviews.filter(
        (review) => review.details && review.details[category] >= 1 && review.details[category] <= 5
      );

      detailsPercentage[category] = calculateRatingPercentage(validDetailsReviews, category).percentages;
      detailAverageScores[category] = calculateAverageScore(validDetailsReviews, category);
    });

    // Trả dữ liệu về client
    const response = {
      averageRating,
      ratingPercentage,
      ratingDistribution,
      totalReviews: ratingDistribution.totalReviews,
      detailsPercentage,
      detailAverageScores
    };

    console.log("Thống kê đánh giá:", response);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê đánh giá' });
  }
});
// Lấy tất cả comment của 1 công ty và thông tin công ty
router.get("/company/:companyId/comments", async (req, res) => {
  try {
    const companyId = req.params.companyId;

    const reviews = await Review.find({
      company_id: companyId,
      status: "approved"
    })
      .sort({ created_at: -1 })
      .populate("company_id"); // Lấy thêm thông tin công ty

    res.json(reviews);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách bình luận",
      error: err.message,
    });
  }
});


module.exports = router;
