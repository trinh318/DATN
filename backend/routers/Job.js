const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const Feedback = require('../models/Feedback');
const authenticateToken = require('../middleware/authenticateToken');
const { normalizeQuery } = require("../helper/queryNormalizer");
const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');
const CompanyFollow = require('../models/FollowedCompany');  // Đảm bảo đường dẫn đúng với vị trí của file CompanyFollow.js
const Moderation = require('../models/Moderation');
const Subscription = require('../models/Subscription');
const cron = require('node-cron');
const { automoderate } = require('../services/Moderation');
const checkFeatureAccess = require('../middleware/checkFeatureAccess');
const checkFeatureBySource = require('../middleware/checkFeatureBySource');
// CREATE - Tạo công việc mới
// Trong API server
router.post('/', authenticateToken, checkFeatureAccess('post_jobs'), async (req, res) => {
  try {
    console.log("data insert", req.body);

    const { employer_id, company_id, title, description, requirements, skills, qualifications, salary, job_type, vacancy, location, interview_location, note, application_deadline, benefits, status, test, field, careers } = req.body;

    // Kiểm tra xem công ty có tồn tại không
    const company = await Company.findById(company_id);
    console.log("company id: ", company_id);

    if (!company) {
      return res.status(400).json({ message: 'ID công ty không hợp lệ' });
    }
    let highlighted = false;
    let highlighted_until = null;

    // Kiểm tra nếu user có quyền highlight job (dựa vào gói đã mua)
    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate('currentPackage.packageId');
    console.log("thong tin goi hien tai la", subscription);
    if (subscription && subscription.currentPackage.packageId.features?.some(f => f.key === 'highlight_jobs')) {
      highlighted = true;
      highlighted_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày từ hôm nay
    }
    // Tạo công việc mới
    const job = new Job({
      employer_id,
      company_id,
      title,
      description,
      requirements,
      skills,
      qualifications,
      salary,
      job_type,
      vacancy,
      location,
      interview_location,
      note,
      status: status || 'open',
      application_deadline,
      benefits,
      test: test || null,
      field,
      careers,
      highlighted,
      highlighted_until,
    });
    const descriptionText = `Title: ${title}
    Description: ${description}
    Requirements: ${requirements}
    Skills: ${skills}
    Salary: ${salary}
    Qualifications: ${qualifications}
    Job_type: ${job_type}
    Location: ${location}
    Interview_location: ${interview_location}
    Note : ${note}
    Benefits: ${benefits}
    Quyền lợi: ${benefits}
    Ghi chú: ${note}
    Lĩnh vực: ${job.field}
    Công việc: ${job.careers}`

    const moderationResult = await automoderate(descriptionText);
    // Kiểm tra nếu user có quyền highlight job (dựa vào gói đã mua)

    // Lưu công việc vào cơ sở dữ liệu
    await job.save();
    const moderation = new Moderation({
      job_id: job._id,
      analysis: {
        hfAnalysis: moderationResult.result.hfAnalysis,
        cohereResult: moderationResult.result.cohereResult,
        awsAnalysis: moderationResult.result.awsAnalysis,
        status: moderationResult.status,  // Trạng thái kiểm duyệt từ hệ thống
        reason: moderationResult.status === 'rejected' ? 'Vi phạm nội dung' : null
      },
      status: moderationResult.status, // Lưu trạng thái kiểm duyệt
      created_at: new Date()
    });
    moderation.status = moderationResult.status;
    // Lưu vào database
    await moderation.save();
    job.moderation = moderation._id;
    await job.save();

    if (moderationResult.status !== 'pending') {
      const notification = new Notification({
        user_id: job.employer_id, // Đảm bảo job có employer_id
        title: moderationResult.status === 'approved'
          ? `"${job.title}" Công việc đã được chấp nhận`
          : `"${job.title}" Thông báo kiểm duyệt`,
        message: moderationResult.status === 'approved'
          ? `Công việc "${job.title}" của bạn đã được duyệt và hiển thị trên hệ thống!`
          : `Công việc "${job.title}" của bạn đăng tuyển có thể vi phạm nội dung. Chúng tôi đang thực hiện xem xét!.`,
        read_status: false
      });
      // Lưu thông báo vào database
      await notification.save();
    }
    const followers = await CompanyFollow.find({ company_id });

    for (const follower of followers) {
      const user_id = follower.user_id;

      const companyName = company.company_name;

      const notification = new Notification({
        user_id,
        message: `Công ty "${companyName}" đã đăng 1 bài tuyển dụng mới`,
        read_status: false,
        created_at: new Date(),
      });

      await notification.save();
    }
    res.status(201).json({ message: 'Tạo công việc thành công', job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
});


// READ - Lấy tất cả công việc
router.get('/', async (req, res) => {
  try {
    const { keyword, job_type, location, status } = req.query;

    let filter = { status: 'open' };
    if (keyword) filter.title = { $regex: keyword, $options: 'i' };
    if (job_type) filter.job_type = job_type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) filter.status = status;

    // Tìm kiếm công việc và populate moderation
    const jobs = await Job.find(filter)
      .populate('company_id')
      .populate({
        path: 'moderation',
        select: 'status' // Chỉ lấy trạng thái duyệt
      });

    const filteredJobs = jobs.filter(job =>
      job.moderation && job.moderation.status !== 'pending' && job.moderation.status !== 'rejected'
    );
    res.json(filteredJobs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});


router.get('/filter', async (req, res) => {
  try {
    const { keyword, job_type, location, company_name, min_salary, max_salary, industry, skills } = req.query;

    let filter = {};

    // Filter by keyword
    if (keyword) filter.title = { $regex: keyword, $options: 'i' };

    // Filter by job type
    if (job_type) filter.job_type = job_type;

    // Filter by location
    if (location) filter.location = { $regex: location, $options: 'i' };

    // Filter by salary range
    if (min_salary && max_salary) {
      filter.salary = { $gte: parseInt(min_salary), $lte: parseInt(max_salary) };
    } else if (min_salary) {
      filter.salary = { $gte: parseInt(min_salary) };
    } else if (max_salary) {
      filter.salary = { $lte: parseInt(max_salary) };
    }

    // Filter by industry and company name
    const companyFilter = {};
    if (industry) companyFilter.industry = { $regex: industry, $options: 'i' };
    if (company_name) companyFilter.name = { $regex: company_name, $options: 'i' };

    // Filter by skills (matching at least one skill)
    if (skills) {
      const skillsArray = skills.split(',');  // Assuming skills are provided as a comma-separated string
      filter.skills = { $in: skillsArray };
    }

    // Fetch jobs based on filters
    const jobs = await Job.find(filter).populate({
      path: 'company_id',
      match: companyFilter,
    }).exec();

    const filteredJobs = jobs.filter((job) => job.company_id);

    res.json(filteredJobs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});



//load danh sách công việc
// READ - Lấy tất cả công việc (chỉ danh sách, không filter, không phân trang)
router.get('/all', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('company_id')  // Lấy thông tin công ty
      .populate({
        path: 'moderation',
        select: 'status reason' // Chỉ lấy trạng thái duyệt và lý do
      });// Lấy tất cả công việc và thông tin công ty
    res.json(jobs); // Trả về danh sách công việc
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
});


// READ - Lấy thông tin chi tiết công việc theo ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company_id') // ← Lấy toàn bộ thông tin công ty
      .populate('feedbacks'); // ← Lấy phản hồi nếu cần

    if (!job) return res.status(404).json({ message: 'Công việc không tồn tại' });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

//lay danh sach cong viẹc của 1 cong ty và số lượng người ứng tuyển từng công việc
router.get('/recruiter/jobs-by-company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log("id company: ", companyId);

    // 1. Tìm các job có company_id và status là 'open'
    const jobs = await Job.find({ 
      company_id: companyId,
    });

    // 2. Lọc job có moderation status là 'approved' hoặc 'reported'
    const filteredJobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const moderation = await Moderation.findOne({
          job_id: job._id,
        });

        if (moderation) {
          const applicationCount = await Application.countDocuments({ job_id: job._id });
          return {
            ...job.toObject(),
            applicationCount,
            moderationStatus: moderation.status,
            moderationReason: moderation.reason
          };
        }

        return null;
      })
    );

    // 3. Loại bỏ các job không có moderation hợp lệ
    const validJobs = filteredJobsWithCounts.filter(job => job !== null);

    res.status(200).json(validJobs);
  } catch (error) {
    console.error('Error fetching filtered jobs:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách công việc.' });
  }
});

//lay danh sach cong viẹc của 1 cong ty và số lượng người ứng tuyển từng công việc
router.get('/jobs-by-company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log("id company: ", companyId);

    // 1. Tìm các job có company_id và status là 'open'
    const jobs = await Job.find({ 
      company_id: companyId,
      status: 'open' // chỉ lấy job đang mở
    });

    // 2. Lọc job có moderation status là 'approved' hoặc 'reported'
    const filteredJobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const moderation = await Moderation.findOne({
          job_id: job._id,
          status: { $in: ['approved', 'reported'] }
        });

        if (moderation) {
          const applicationCount = await Application.countDocuments({ job_id: job._id });
          return {
            ...job.toObject(),
            applicationCount,
            moderationStatus: moderation.status,
            moderationReason: moderation.reason
          };
        }

        return null;
      })
    );

    // 3. Loại bỏ các job không có moderation hợp lệ
    const validJobs = filteredJobsWithCounts.filter(job => job !== null);

    res.status(200).json(validJobs);
  } catch (error) {
    console.error('Error fetching filtered jobs:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách công việc.' });
  }
});

// UPDATE - Cập nhật công việc
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Công việc không tồn tại' });

    const oldJobData = { ...job.toObject() }; // Lưu trữ dữ liệu công việc cũ để so sánh
    console.log("oldJobData: ", oldJobData);
    console.log("req.body: ", req.body);
    console.log("job: ", job);

    // Cập nhật các trường công việc
    job.title = req.body.title || job.title;
    job.description = req.body.description || job.description;
    job.requirements = req.body.requirements || job.requirements;
    job.skills = req.body.skills || job.skills;
    job.qualifications = req.body.qualifications || job.qualifications;
    job.salary = req.body.salary || job.salary;
    job.job_type = req.body.job_type || job.job_type;
    job.vacancy = req.body.vacancy || job.vacancy;
    job.location = req.body.location || job.location;
    job.interview_location = req.body.interview_location || job.interview_location;
    job.note = req.body.note || job.note;
    job.status = req.body.status || job.status;
    job.application_deadline = req.body.application_deadline || job.application_deadline;
    job.benefits = req.body.benefits || job.benefits; // Giả sử benefits là một trường mới
    job.test = req.body.test || job.test;
    job.field = req.body.field || job.field;
    job.careers = req.body.careers || job.careers;

    const isJobUpdated = JSON.stringify(oldJobData) !== JSON.stringify(job.toObject());

    // Kiểm tra xem công việc có thay đổi hay không
    if (isJobUpdated) {
      // Nếu công việc có thay đổi, kiểm tra trạng thái kiểm duyệt
      const descriptionText = `Title: ${job.title}
      Description: ${job.description}
      Requirements: ${job.requirements}
      Skills: ${job.skills}
      Salary: ${job.salary}
      Qualifications: ${job.qualifications}
      Job_type: ${job.job_type}
      Location: ${job.location}
      Interview_location: ${job.interview_location}
      Note : ${job.note}
      Benefits: ${job.benefits}
      Quyền lợi: ${job.benefits}
      Ghi chú: ${job.note}
      Lĩnh vực: ${job.field}
      Công việc: ${job.careers}`;

      const moderationResult = await automoderate(descriptionText); // Kiểm duyệt nội dung

      console.log("moderationResult: ", moderationResult);

      // Tìm kiếm Moderation đã tồn tại
      let moderation = await Moderation.findOne({ job_id: job._id });

      if (moderation) {
        // Nếu Moderation đã tồn tại, cập nhật thông tin
        moderation.analysis = {
          hfAnalysis: moderationResult.result.hfAnalysis,
          cohereResult: moderationResult.result.cohereResult,
          awsAnalysis: moderationResult.result.awsAnalysis,
          status: moderationResult.status, // Trạng thái kiểm duyệt từ hệ thống
          reason: moderationResult.status === 'rejected' ? 'Vi phạm nội dung' : null
        };
        moderation.status = moderationResult.status; // Cập nhật trạng thái kiểm duyệt
        await moderation.save(); // Lưu lại sự thay đổi
      } else {
        // Nếu không có Moderation, tạo mới
        moderation = new Moderation({
          job_id: job._id,
          analysis: {
            hfAnalysis: moderationResult.result.hfAnalysis,
            cohereResult: moderationResult.result.cohereResult,
            awsAnalysis: moderationResult.result.awsAnalysis,
            status: moderationResult.status, // Trạng thái kiểm duyệt từ hệ thống
            reason: moderationResult.status === 'rejected' ? 'Vi phạm nội dung' : null
          },
          status: moderationResult.status, // Lưu trạng thái kiểm duyệt
          created_at: new Date()
        });
        await moderation.save();
      }

      job.moderation = moderation._id;
      await job.save(); // Lưu lại công việc sau khi cập nhật moderation

      // Tạo thông báo cho nhà tuyển dụng nếu công việc đã được duyệt hoặc bị từ chối
      if (moderationResult.status !== 'pending') {
        const notification = new Notification({
          user_id: job.employer_id, // Đảm bảo job có employer_id
          title: moderationResult.status === 'approved'
            ? `"${job.title}" Công việc đã được chấp nhận`
            : `"${job.title}" Thông báo kiểm duyệt`,
          message: moderationResult.status === 'approved'
            ? `Công việc "${job.title}" của bạn đã được duyệt và hiển thị trên hệ thống!`
            : `Công việc "${job.title}" của bạn đăng tuyển có thể vi phạm nội dung. Chúng tôi đang thực hiện xem xét!`,
          read_status: false
        });

        // Lưu thông báo vào database
        await notification.save();
      }

      // Tạo thông báo cho những người theo dõi công ty
      const followers = await CompanyFollow.find({ company_id: job.company_id });

      for (const follower of followers) {
        const user_id = follower.user_id;
        const companyName = job.company_name; // Assuming company_name is available

        const notification = new Notification({
          user_id,
          message: `Công ty "${companyName}" đã đăng 1 bài tuyển dụng mới`,
          read_status: false,
          created_at: new Date(),
        });

        await notification.save();
      }
    }

    res.json({ message: 'Cập nhật công việc thành công', job });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

// DELETE - Xóa công việc
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Xóa công việc
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

////tìm kiếm công việc
router.get("/search-job/search", async (req, res) => {
  try {
    const { query, location, careers } = req.query;

    console.log("Query received:", query);
    console.log("Location received:", location);
    console.log("Careers received:", careers);

    // Chuẩn hóa query
    const normalizedQuery = normalizeQuery(query);

    const searchCriteria = { $and: [] };

    // Tìm kiếm toàn văn
    if (normalizedQuery) {
      const companyIds = await Company.find({
        $or: [
          { company_name: { $regex: normalizedQuery, $options: "i" } },
          { industry: { $regex: normalizedQuery, $options: "i" } },
        ],
      }).select("_id");

      searchCriteria.$and.push({
        $or: [
          { title: { $regex: normalizedQuery, $options: "i" } },
          { description: { $regex: normalizedQuery, $options: "i" } },
          { requirements: { $regex: normalizedQuery, $options: "i" } },
          { skills: { $regex: normalizedQuery, $options: "i" } },
          { qualifications: { $regex: normalizedQuery, $options: "i" } },
          { benefits: { $regex: normalizedQuery, $options: "i" } },
          { job_type: { $regex: normalizedQuery, $options: "i" } },
          { company_id: { $in: companyIds.map((company) => company._id) } },
        ],
      });
    }

    // Tìm kiếm theo địa điểm
    if (location && location.trim() && location !== "Tất cả tỉnh/thành phố") {
      searchCriteria.$and.push({ location: { $regex: location.trim(), $options: "i" } });
    }
    if (careers) {
      // Chuẩn hóa chuỗi: NFC + bỏ non-breaking space
      const normalizedCareers = careers.normalize("NFC").replace(/\u00A0/g, " ");

      // Tách chuỗi, loại khoảng trắng dư, chuẩn hóa tiếp và loại bỏ rỗng
      const careerList = normalizedCareers
        .split(",")
        .map(career => career.trim().normalize("NFC"))
        .filter(career => career !== "");

      console.log("Career list parsed:", careerList);

      if (careerList.length > 0) {
        const careerRegexQueries = careerList
          .map((career, idx) => {
            try {
              // Loại bỏ ký tự điều khiển ẩn nếu có
              const cleanCareer = career.replace(/[^\P{C}]+/gu, "").trim();

              if (!cleanCareer) {
                console.warn(`⚠️ Career ${idx} is empty after cleaning.`);
                return null;
              }

              const regex = new RegExp(cleanCareer, "i");

              console.log(`✅ Regex ${idx} created for career "${career}":`, regex.toString());

              return {
                careers: { $elemMatch: { $regex: regex } }
              };
            } catch (err) {
              console.warn("⚠️ Invalid RegExp for career:", career, "Error:", err.message);
              return null;
            }
          })
          .filter(q => q !== null);

        if (careerRegexQueries.length > 0) {
          searchCriteria.$and.push({ $or: careerRegexQueries });
        }
      }
    }

    // Tránh dùng JSON.stringify trực tiếp với RegExp, dùng stringifyQuery
    function stringifyQuery(obj) {
      return JSON.stringify(obj, (key, value) => {
        if (value instanceof RegExp) return value.toString();
        return value;
      }, 2);
    }

    const queryCriteria = searchCriteria.$and.length > 0 ? searchCriteria : {};
    console.log("Final search criteria:", stringifyQuery(queryCriteria));


    const jobs = await Job.find(queryCriteria).populate({
      path: "company_id",
      select: "company_name industry logo",
    });

    const approvedJobIds = await Moderation.find({
      "status": "approved",
    }).distinct("job_id");

    const filteredJobs = jobs.filter((job) =>
      approvedJobIds.some((id) => id.toString() === job._id.toString())
    );
    console.log("Total jobs matched by search:", jobs.length);
    console.log("Approved job IDs:", approvedJobIds.map(id => id.toString()));
    console.log("Filtered jobs after moderation:", filteredJobs.length);

    res.status(200).json(filteredJobs);
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm công việc.", error: error.message });
  }
});

// Router lọc công việc
router.get('/search-jobs/filter-jobs', async (req, res) => {
  console.log("Đây là request filter-jobs");

  try {
    const { industry, salary, experience, employmentType } = req.query;
    const filters = {};

    // Lọc theo ngành nghề
    if (industry) {
      console.log("Ngành nghề:", industry);

      // Tách các ngành nghề thành mảng (có thể có nhiều ngành nghề được gửi qua dấu phẩy)
      const industriesArray = industry.split(',').map(item => item.trim().toLowerCase());

      // Tìm công việc và lọc theo ngành nghề của công ty
      const jobs = await Job.find()
        .populate('company_id', 'industry')  // Populate ngành nghề của công ty

      // Dùng filter trực tiếp trên mảng công việc để lọc theo ngành nghề
      const filteredJobs = jobs.filter(job => {
        if (job.company_id && job.company_id.industry) {
          // Chuyển ngành nghề của công ty thành chữ thường để so sánh
          const companyIndustry = job.company_id.industry.toLowerCase();
          console.log("Ngành nghề company:", companyIndustry);

          // Duyệt qua tất cả các ngành nghề trong industriesArray và kiểm tra từ khóa
          return industriesArray.some(industryKey => companyIndustry.includes(industryKey));
        }
        return false;
      });

      console.log("Số lượng công việc sau khi lọc ngành nghề:", filteredJobs.length);

      // Trả về các công việc đã lọc
      return res.json(filteredJobs);
    }

    // Lọc theo kinh nghiệm (năm)
    if (experience) {
      console.log("Kinh nghiệm:", experience);

      const experienceRanges = experience.split(',').map(range => range.trim());

      experienceRanges.forEach(range => {
        const experienceRange = range.split('-').map(Number); // Split cho trường hợp "1-2", "3-5", hoặc "3"
        if (experienceRange.length === 1) {
          // Trường hợp người dùng chọn một số năm cụ thể, ví dụ "3" thay vì "1-2"
          filters.requirements = { $regex: `${experienceRange[0]} năm`, $options: 'i' }; // Tìm "3 năm" trong yêu cầu
        } else if (experienceRange.length === 2) {
          // Trường hợp người dùng chọn một khoảng, ví dụ "1-2"
          const [minExp, maxExp] = experienceRange;
          filters.requirements = {
            $regex: `(?:${minExp}|${maxExp}|[${minExp}-${maxExp}])`,
            $options: 'i'
          };  // Tìm kinh nghiệm trong khoảng từ minExp đến maxExp
        }
      })

    }

    // Lọc theo loại công việc
    if (employmentType) {
      console.log("Loại hình công việc:", employmentType);
      filters.job_type = { $in: employmentType.split(',') };  // Lọc theo danh sách loại hình công việc
    }

    // Tìm kiếm công việc với các bộ lọc đã xác định
    const jobs = await Job.find(filters);

    // Nếu có lọc theo mức lương, lọc lại trong bộ dữ liệu đã tìm được
    if (salary) {
      console.log("Mức lương:", salary);
      const salaryRanges = salary.split(','); // Tách các khoảng lương từ query

      // Lọc các công việc có mức lương trong khoảng được chỉ định
      const filteredJobs = jobs.filter(job => {
        let jobSalary = job.salary;
        console.log("Lương DB:", jobSalary);

        // Tách mức lương từ dữ liệu của công việc (có thể là một chuỗi, ví dụ "1000-2000" hoặc "1000")
        if (jobSalary.includes('-')) {
          const [jobMinSalary, jobMaxSalary] = jobSalary.split('-').map(Number);

          // Kiểm tra mức lương có nằm trong khoảng salaryRanges không
          return salaryRanges.some(range => {
            if (range.includes('-')) {
              const [minSalary, maxSalary] = range.split('-').map(Number);

              // Xử lý TH1: Filter "1000-2000", job.salary "1500-2500"
              if (jobMinSalary > minSalary && jobMinSalary < maxSalary) {
                return true;
              }
              // Xử lý TH2: Filter "1000-2000", job.salary "800-1500"
              if (jobMaxSalary > minSalary && jobMaxSalary < maxSalary) {
                return true;
              }
              return false;
            } else {
              const exactSalary = Number(range);
              // Xử lý TH4: Filter "6000", job.salary "4500-6500"
              return jobMaxSalary > exactSalary;
            }
          });
        } else {
          // Nếu mức lương không phải là khoảng mà chỉ là một con số
          const jobSalaryNumber = Number(jobSalary);
          return salaryRanges.some(range => {
            // Trường hợp TH3: Filter "1000-2000", job.salary "1400"
            if (range.includes('-')) {
              const [minSalary, maxSalary] = range.split('-').map(Number);
              return jobSalaryNumber > minSalary && jobSalaryNumber < maxSalary;
            } else {
              const exactSalary = Number(range);
              // Trường hợp TH5: Filter "6000", job.salary "4500"
              return jobSalaryNumber > exactSalary;
            }
          });
        }
      });

      console.log("Số lượng công việc sau khi lọc lương:", filteredJobs.length);

      // Chỉ trả về một lần duy nhất
      return res.json(filteredJobs);  // Trả về danh sách công việc đã lọc
    }
    // Chỉ trả về một lần duy nhất
    return res.json(jobs);  // Trả về tất cả công việc tìm thấy



  } catch (error) {
    console.error('Lỗi khi tìm kiếm công việc:', error);

    // Nếu có lỗi, chỉ trả về một lần duy nhất
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Đã xảy ra lỗi khi tìm kiếm công việc' });
    }
  }
});

// Từ khóa cho các loại công việc
const categories = {
  IT: ['IT', 'Software', 'Web', 'Developer', 'Programmer', 'Coding', 'JavaScript', 'React', 'Node.js'],
  Business: ['Kinh doanh', 'Business', 'Marketing', 'Sales', 'Manager', 'Business Development'],
  Construction: ['Xây dựng', 'Construction', 'Engineer', 'Building'],
  Education: ['Giáo dục', 'Teacher', 'Education', 'Trainer', 'Academic'],
  Photoshop: ['Photoshop', 'Designer', 'Graphic', 'Photoshop'],
  Others: ['Khác']
};

// Thống kê công việc theo các loại
router.get('/all-jobs/job-stats', async (req, res) => {
  try {
    const jobStats = {
      IT: 0,
      Business: 0,
      Construction: 0,
      Education: 0,
      Photoshop: 0,
      Others: 0
    };

    // Lấy tất cả công việc
    const jobs = await Job.find({}).select('title description requirements skills');

    // Nếu không có công việc nào
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: 'Không có công việc nào để thống kê' });
    }

    // Duyệt qua các công việc để phân loại
    jobs.forEach(job => {
      let categoryMatched = false;

      // Kiểm tra nếu công việc khớp với bất kỳ danh mục nào
      for (const [category, keywords] of Object.entries(categories)) {
        const match = keywords.some(keyword =>
          (job.title && job.title.includes(keyword)) ||
          (job.description && job.description.includes(keyword)) ||
          (job.requirements && job.requirements.includes(keyword)) ||
          (job.skills && job.skills.some(skill => skill.includes(keyword)))
        );

        if (match) {
          jobStats[category] += 1;
          categoryMatched = true;
          break;
        }
      }

      // Nếu không khớp với bất kỳ loại nào, cho vào loại "Khác"
      if (!categoryMatched) {
        jobStats.Others += 1;
      }
    });

    res.status(200).json(jobStats);
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ message: 'Lỗi khi thống kê công việc', error: error.message });
  }
});

router.get('/jobs/same-company/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Tìm công việc theo jobId
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 2. Lấy các công việc cùng công ty (trừ chính nó) và có status là 'open'
    const sameCompanyJobs = await Job.find({
      company_id: job.company_id,
      _id: { $ne: jobId },
      status: 'open'
     }).populate('company_id');

    // 3. Lọc các job có moderation status là 'approved' hoặc 'reported'
    const filteredJobs = await Promise.all(
      sameCompanyJobs.map(async (j) => {
        const moderation = await Moderation.findOne({
          job_id: j._id,
          status: { $in: ['approved', 'reported'] }
        });

        if (moderation) {
          return {
            ...j.toObject(),
            moderationStatus: moderation.status
          };
        }
        return null;
      })
    );

    // 4. Loại bỏ các job không đạt điều kiện moderation
    const validJobs = filteredJobs.filter(job => job !== null);

    res.status(200).json(validJobs);
  } catch (error) {
    console.error('Error fetching jobs from the same company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const updateExpiredJobs = async () => {
  try {
    const currentDate = new Date();

    // Cập nhật trạng thái 'closed' cho các công việc có hạn nộp đơn đã qua
    const result = await Job.updateMany(
      { application_deadline: { $lt: currentDate }, status: 'open' },
      { $set: { status: 'closed' } }
    );

    console.log(`Updated ${result.modifiedCount} expired jobs to 'closed'`);
  } catch (error) {
    console.error('Error updating expired jobs:', error);
  }
};

// Lên lịch chạy tự động lúc 00:00 hàng ngày
setTimeout(() => {
  console.log('Running job status update after 10 seconds...');
  updateExpiredJobs();
}, 11 * 1000); // 10 giây

module.exports = router;
