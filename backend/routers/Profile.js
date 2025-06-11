const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const User = require('../models/User');
const CvFile = require('../models/CvFile');
const Application = require('../models/Application');
const authenticateToken = require('../middleware/authenticateToken');
const Academic = require('../models/Academic');
const Experience = require('../models/Experience');
const InterviewSchedule = require('../models/InterviewSchedule');
const Notification = require('../models/Notification');
const checkFeatureAccess = require('../middleware/checkFeatureAccess');
const checkFeatureBySource = require('../middleware/checkFeatureBySource');
// GET all profiles (if needed)
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user_id');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route tạo hồ sơ mới
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, nationality, date_of_birth, location, job_title, job_level, experience, skills, cv_files } = req.body;

    // Kiểm tra xem người dùng đã có profile chưa
    let profile = await Profile.findOne({ user_id: req.userId });

    if (profile) {
      return res.status(400).json({ message: 'Profile already exists' });  // Nếu profile đã tồn tại, không tạo lại
    }

    // Nếu chưa có profile, tạo mới
    profile = new Profile({
      user_id: req.userId,
      first_name,
      last_name,
      email,
      phone,
      nationality,
      date_of_birth,
      location,
      job_title,
      job_level,
      experience,
      skills,
      cv_files,
      state: 'undefined', // Gán giá trị trạng thái là undefined
    });

    await profile.save();
    return res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ message: 'Error creating profile', error });
  }
});
router.put('/update-skills', async (req, res) => {
  try {
    const { userId, skills } = req.body;
    console.log("j")

    // Kiểm tra nếu thiếu thông tin
    if (!userId || !skills) {
      return res.status(400).json({ message: 'Thông tin kỹ năng không hợp lệ.' });
    }

    // Tìm profile của người dùng và cập nhật kỹ năng
    const profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Không tìm thấy profile của người dùng.' });
    }

    // Cập nhật danh sách kỹ năng
    profile.skills = skills;

    // Lưu thông tin mới
    await profile.save();
    console.log("j")
    res.status(200).json({ message: 'Cập nhật kỹ năng thành công.', profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: 'Lỗi khi cập nhật kỹ năng.', error: error.message });
  }
});

router.get('/skills/:userId', async (req, res) => {
  try {
    const { userId } = req.params;  // Lấy userId từ URL
    const profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    // Trả về kỹ năng của người dùng
    res.json({ skills: profile.skills });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/profile', async (req, res) => {
  const { user_id, first_name, last_name, email, phone,
    nationality, date_of_birth, location, specific_address, job_title,
    job_level, current_industry, current_field, years_of_experience,
    current_salary, desired_work_location, desired_salary, education,
    experience, skills, cv_files, avatar } = req.body;

  // Kiểm tra các trường bắt buộc có bị thiếu không
  if (!user_id || !first_name || !last_name || !email || !phone) {
    return res.status(400).json({ message: 'Hồ sơ bị thiếu vui lòng điền đầy đủ thông tin!' });
  }

  try {
    // Tìm profile của người dùng
    let profile = await Profile.findOne({ user_id });

    // Tìm user trong bảng User
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cập nhật avatar vào User model
    if (avatar) {
      user.avatar = avatar; // Cập nhật avatar
      await user.save(); // Lưu thay đổi vào database
    }

    if (profile) {
      // Nếu đã có profile, cập nhật thông tin
      profile.first_name = first_name || profile.first_name;
      profile.last_name = last_name || profile.last_name;
      profile.email = email || profile.email;
      profile.phone = phone || profile.phone;
      profile.nationality = nationality || profile.nationality;
      profile.date_of_birth = date_of_birth || profile.date_of_birth;
      profile.location = location || profile.location;
      profile.specific_address = specific_address || profile.specific_address;
      profile.job_title = job_title || profile.job_title;
      profile.job_level = job_level || profile.job_level;
      profile.current_industry = current_industry || profile.current_industry;
      profile.current_field = current_field || profile.current_field;
      profile.years_of_experience = years_of_experience || profile.years_of_experience;
      profile.current_salary = current_salary || profile.current_salary;
      profile.desired_work_location = desired_work_location || profile.desired_work_location;
      profile.desired_salary = desired_salary || profile.desired_salary;
      profile.education = education || profile.education;
      profile.experience = experience && experience.length > 0 ? experience : profile.experience;
      profile.skills = skills && skills.length > 0 ? skills : profile.skills;
      profile.cv_files = cv_files || profile.cv_files;

      await profile.save();
      return res.status(200).json({ success: true, message: 'Profile updated successfully', profile });
    } else {
      // Nếu chưa có profile, tạo mới
      profile = new Profile({
        user_id,
        first_name,
        last_name,
        email,
        phone,
        nationality,
        date_of_birth,
        location,
        specific_address,
        job_title,
        job_level,
        current_industry,
        current_field,
        years_of_experience,
        current_salary,
        desired_work_location,
        desired_salary,
        education,
        experience: experience && experience.length > 0 ? experience : [],
        skills: skills && skills.length > 0 ? skills : [],
        cv_files,
        state: 'pending', // Gán giá trị trạng thái là undefined
      });

      await profile.save();
      return res.status(201).json({ success: true, message: 'Profile created successfully', profile });
    }
  } catch (err) {
    //console.error('Error occurred:', err.message); // Log chi tiết lỗi
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation error', details: err.errors });
    }
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.get('/list', authenticateToken, async (req, res) => {
  try {
    // Find the profile for the logged-in user using their userId
    const profile = await Profile.findOne({ user_id: req.userId });

    if (!profile) {
      return res.status(404).json({ message: 'No profile found for this user' });
    }

    return res.status(200).json(profile);  // Return the logged-in user's profile
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// GET profile by user ID (job details for user)
router.get('/job/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.params.userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile không tồn tại.' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Có lỗi khi lấy thông tin profile.' });
  }
});

// GET profile by ID
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const profile = await Profile.findOne({ user_id }).populate('user_id'); // Populate nếu cần

    if (!profile) {
      return res.status(200).json({ message: 'Profile chưa được cập nhật', profile: null }); // Profile không tồn tại
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route lấy thông tin profile và thông tin học vấn của một người
router.get('/profile/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Lấy profile của người dùng
    const profile = await Profile.findOne({ user_id }).populate('user_id'); // Nếu cần populate thêm thông tin từ bảng user

    if (!profile) {
      return res.status(200).json({ message: 'Profile chưa được cập nhật', profile: null });
    }

    // Lấy thông tin học vấn của người dùng
    const academicData = await Academic.find({ user_id });

    // Kiểm tra nếu không có thông tin học vấn
    const educationInfo = academicData.length > 0
      ? academicData.map(item => `${item.degree} ${item.school_name}`).join(" - ")
      : '';

    // Kết hợp thông tin profile và học vấn
    const responseData = {
      ...profile.toObject(), // Chuyển profile thành object
      education: educationInfo, // Thêm thông tin học vấn vào profile
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching profile and academic data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update profile by ID
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { full_name, address, education, experience, skills, cv_file, industry } = req.body; // Include industry in the request body

  // Kiểm tra ObjectId hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid profile ID' });
  }

  try {
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Kiểm tra quyền truy cập
    if (profile.user_id.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to edit this profile' });
    }

    // Cập nhật hồ sơ
    const updatedProfile = await Profile.findByIdAndUpdate(
      id,
      {
        full_name,
        address,
        education,
        experience,
        skills,
        cv_file,
        industry, // Update industry
        updated_at: new Date()
      },
      { new: true } // Trả về hồ sơ đã được cập nhật
    );

    res.json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE profile by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid profile ID' });
  }

  try {
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Ensure the user can only delete their own profile
    if (profile.user_id.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this profile' });
    }

    await Profile.findByIdAndDelete(id);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/follower-profiles', async (req, res) => {
  try {
    const { userIds } = req.body;
    console.log("follower: ", userIds);

    const profiles = await Profile.find({ user_id: { $in: userIds } })
      .populate('user_id');

    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Failed to fetch profiles.' });
  }
});

// GET all profiles with role "applicant"
router.get('/profile-user/alls', async (req, res) => {
  try {
    // Lọc các profiles mà User có role là "applicant"
    const profiles = await Profile.find()
      .populate({
        path: 'user_id', // Giả sử profile có trường 'user_id' tham chiếu đến User
        match: { role: 'applicant' }, // Lọc User có role là "applicant"
        select: 'role' // Chỉ lấy thông tin về role của User
      })
      .exec(); // Thực thi truy vấn

    // Lọc bỏ những profile không có user_id hoặc role không phải là "applicant"
    const filteredProfiles = profiles.filter(profile => profile.user_id);

    // Kiểm tra nếu không có profile nào
    if (filteredProfiles.length === 0) {
      return res.status(404).json({ message: 'No profiles found with role "applicant"' });
    }

    return res.status(200).json({ success: true, profiles: filteredProfiles });
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return res.status(500).json({ success: false, message: 'Server error', error });
  }
});

// GET profile by applicantId
router.get('/applicant/:applicantId', async (req, res) => {
  try {
    const { applicantId } = req.params; // Get applicantId from the request parameters
    const profile = await Profile.findOne({ _id: applicantId }).populate('_id'); // Find profile by user_id (applicantId)

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found for the given applicantId' });
    }

    res.status(200).json(profile); // Return the found profile
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET profile ứng viên by applicantId
router.get('/applicant/profile/:applicantId', authenticateToken, checkFeatureBySource, async (req, res) => {
  try {
    const { applicantId } = req.params; // Lấy applicantId từ request params
    const { source, jobId } = req.query;
    console.log("thong tin cua source", source);


    // Tìm profile của ứng viên theo _id của Profile (applicantId)
    const profile = await Profile.findById(applicantId).populate('user_id'); // Populate user_id trong Profile

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found for the given applicantId' });
    }

    // Lấy thông tin academic và experience dựa trên user_id của Profile
    const academicData = await Academic.find({ user_id: profile.user_id }); // Tìm các academic records theo user_id
    const experienceData = await Experience.find({ userId: profile.user_id }); // Tìm các experience records theo userId

    // Trả về kết quả với thông tin profile, academic và experience
    res.status(200).json({
      profile,
      academic: academicData,
      experience: experienceData
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/filter', async (req, res) => {
  try {
    const { specific_address, job_title, job_level, years_of_experience, skills } = req.query;

    let filter = {};
    console.log('Filter request received:', req.query);
    const applicantUsers = await User.find({ role: 'applicant' }).select('_id');
    const applicantIds = applicantUsers.map((user) => user._id);

    // Đảm bảo `applicantIds` là một mảng hợp lệ
    if (applicantIds.length > 0) {
      filter.user_id = { $in: applicantIds };
    } else {
      console.error('No applicant IDs found.');
      return res.status(400).json({ message: 'Không tìm thấy ứng viên.' });
    }

    // Thêm các bộ lọc khác nếu hợp lệ
    if (specific_address && specific_address.trim()) {
      filter.specific_address = { $regex: specific_address, $options: 'i' };
    }
    if (job_title && job_title.trim()) {
      filter.job_title = { $regex: job_title, $options: 'i' };
    }
    if (job_level && job_level.trim()) {
      filter.job_level = { $regex: job_level, $options: 'i' };
    }
    if (years_of_experience) {
      const years = parseInt(years_of_experience);
      if (!isNaN(years)) filter.years_of_experience = years;
    }
    if (skills && skills.trim()) {
      const skillsArray = skills.split(',');
      filter.skills = { $in: skillsArray };
    }

    const profiles = await Profile.find(filter).exec();
    res.json(profiles);
  } catch (error) {
    console.error('Error filtering profiles:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

router.get('/applications/applied-profiles/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { interviewer_id } = req.query;

    if (!jobId || !interviewer_id) {
      return res.status(400).json({ message: 'jobId and interviewer_id are required.' });
    }

    const applications = await Application.find({ job_id: jobId }).lean();
    if (!applications.length) {
      return res.status(404).json({ message: 'No applications found for the given jobId.' });
    }

    const candidateIds = applications.map((app) => app.candidate_id);

    const applicationMap = {};
    applications.forEach(app => {
      applicationMap[app.candidate_id.toString()] = app;
    });

    const profiles = await Profile.find({ user_id: { $in: candidateIds } }).lean();
    if (!profiles.length) {
      return res.status(404).json({ message: 'No profiles found for the applied candidates.' });
    }

    const userIds = profiles.map(p => p.user_id);
    const users = await User.find({ _id: { $in: userIds } }).lean();

    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    // Truy vấn tất cả CVFiles một lần
    const cvFiles = await CvFile.find({
      uploadedBy: { $in: candidateIds },
      is_active: true,
    }).sort({ createdAt: -1 }).lean(); // Ưu tiên file mới nhất

    const cvMap = {};
    cvFiles.forEach(file => {
      if (!cvMap[file.uploadedBy.toString()]) {
        cvMap[file.uploadedBy.toString()] = file; // mỗi ứng viên 1 CV file
      }
    });

    const response = await Promise.all(
      profiles.map(async (profile) => {
        const userInfo = userMap[profile.user_id.toString()];
        profile.user_id = userInfo || {};

        const application = applicationMap[userInfo?._id?.toString()] || null;
        const cvFile = cvMap[userInfo?._id?.toString()] || null;

        const schedules = await InterviewSchedule.find({
          job_id: jobId,
          interviewer_id,
          candidate_id: userInfo?._id,
          status: { $ne: 'cancle' },
        });

        const interviewArray = schedules.map((i) => ({
          time: i.start_time,
          location: i.location || '',
          status: i.status,
          note: i.notes || '',
        }));

        return {
          profile,
          interviews: interviewArray,
          application,
          cvFile, // Thêm ở đây
        };
      })
    );

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while processing the data.' });
  }
});

// GET profile by userId
router.get('/admin/applicant-profile/:userId', async (req, res) => {
  console.log("Fetching profile for userId:", req.params.userId);
  try {
    const { userId } = req.params; // Lấy userId từ request params
    const profile = await Profile.findOne({ user_id: userId }).populate('user_id'); // Tìm profile theo userId và populate thông tin user_id

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found for the given userId' });
    }

    res.status(200).json(profile); // Trả về thông tin profile
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

///search profile
// router.js
router.get('/search-profile/filter-profile/applicant', authenticateToken, checkFeatureAccess('access_resume_database'), async (req, res) => {
  try {
    const { industry, salary, experience } = req.query;
    console.log("Received filters: ", req.query);  // Kiểm tra đầu vào

    const filters = {};

    // Lọc theo ngành nghề
    if (industry) {
      filters.current_industry = industry; // Cập nhật bộ lọc theo ngành
    }

    // Lọc hồ sơ từ MongoDB (không sử dụng so sánh trực tiếp trong MongoDB)
    let profiles = await Profile.find(filters);

    // Nếu có filter mức lương, xử lý sau khi lấy dữ liệu từ MongoDB
    if (salary) {
      // Nếu salary có dấu "," (nhiều dải lương), tách thành mảng
      if (salary.includes(',')) {
        const salaryRanges = salary.split(','); // Tách chuỗi thành mảng

        // Lọc hồ sơ theo các điều kiện dải lương
        profiles = profiles.filter(profile => {
          const profileSalary = Number(profile.desired_salary);

          // Kiểm tra profileSalary có hợp lệ không
          if (isNaN(profileSalary)) {
            return false;
          }

          return salaryRanges.some(s => {
            if (s.includes('-')) {
              // Trường hợp có dấu "-", tách thành min-max
              const [min, max] = s.split('-').map(Number);
              return profileSalary >= min && profileSalary <= max;
            } else {
              // Trường hợp không có dấu "-"
              const singleValue = Number(s.trim());
              if (!isNaN(singleValue)) {
                if (singleValue === 1000) {
                  return profileSalary < singleValue;
                } else if (singleValue === 12000) {
                  return profileSalary > singleValue;
                }
              }
              return false;
            }
          });
        });
      } else {
        // Trường hợp salary không có dấu ","
        if (salary.includes('-')) {
          // Có dấu "-", tách thành min-max
          const [min, max] = salary.split('-').map(Number);

          profiles = profiles.filter(profile => {
            const profileSalary = Number(profile.desired_salary);
            return !isNaN(profileSalary) && profileSalary >= min && profileSalary <= max;
          });
        } else {
          // Không có dấu "-", xử lý như giá trị đơn
          const singleValue = Number(salary.trim());

          if (!isNaN(singleValue)) {
            if (singleValue === 1000) {
              profiles = profiles.filter(profile => {
                const profileSalary = Number(profile.desired_salary);
                return !isNaN(profileSalary) && profileSalary < singleValue;
              });
            } else if (singleValue === 12000) {
              profiles = profiles.filter(profile => {
                const profileSalary = Number(profile.desired_salary);
                return !isNaN(profileSalary) && profileSalary > singleValue;
              });
            }
          }
        }
      }
    }

    console.log("profile sau filter salary", profiles)


    if (experience) {
      // Nếu experience có dấu "," (nhiều dải kinh nghiệm), tách thành mảng
      if (experience.includes(',')) {
        const experienceRanges = experience.split(','); // Tách chuỗi thành mảng

        profiles = profiles.filter(profile => {
          const profileExperience = Number(profile.years_of_experience);

          // Kiểm tra profileExperience có hợp lệ không
          if (isNaN(profileExperience)) {
            return false;
          }

          return experienceRanges.some(s => {
            if (s.includes('-')) {
              // Trường hợp có dấu "-", tách thành min-max
              const [min, max] = s.split('-').map(Number);
              return profileExperience >= min && profileExperience <= max;
            } else {
              // Trường hợp không có dấu "-"
              const singleValue = Number(s.trim());
              if (!isNaN(singleValue)) {
                if (singleValue === 0) {
                  return profileExperience === 0; // Kinh nghiệm bằng 0
                } else if (singleValue === 5) {
                  return profileExperience > 5; // Kinh nghiệm lớn hơn 5
                }
              }
              return false;
            }
          });
        });
      } else {
        // Trường hợp experience không có dấu ","
        if (experience.includes('-')) {
          // Có dấu "-", tách thành min-max
          const [min, max] = experience.split('-').map(Number);

          profiles = profiles.filter(profile => {
            const profileExperience = Number(profile.years_of_experience);
            return !isNaN(profileExperience) && profileExperience >= min && profileExperience <= max;
          });
        } else {
          // Không có dấu "-", xử lý như giá trị đơn
          const singleValue = Number(experience.trim());

          if (!isNaN(singleValue)) {
            if (singleValue === 0) {
              profiles = profiles.filter(profile => {
                const profileExperience = Number(profile.years_of_experience);
                return !isNaN(profileExperience) && profileExperience === 0; // Kinh nghiệm bằng 0
              });
            } else if (singleValue === 5) {
              profiles = profiles.filter(profile => {
                const profileExperience = Number(profile.years_of_experience);
                return !isNaN(profileExperience) && profileExperience > 5; // Kinh nghiệm lớn hơn 5
              });
            }
          }
        }
      }
    }



    res.json(profiles);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm hồ sơ ứng viên:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tìm kiếm hồ sơ ứng viên' });
  }
});

router.put('/admin/edit/:userId', async (req, res) => {
  try {
    const { state, reason } = req.body;
    const { userId } = req.params;

    console.log("Trạng thái:", state);
    console.log("Lý do từ chối:", reason);

    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: userId },
      { state, reason: state === 'rejected' ? reason : '' }, // Xóa lý do nếu không bị từ chối
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ" });
    }

    const notificationMessage = state === 'approved'
      ? 'Hồ sơ của bạn đã được phê duyệt!'
      : state === 'rejected'
        ? `Hồ sơ của bạn đã bị từ chối. Lý do: ${reason}`
        : 'Hồ sơ của bạn đang chờ duyệt.';

    await Notification.create({
      user_id: userId,
      title: 'Cập nhật trạng thái hồ sơ',
      message: notificationMessage,
    });

    res.status(200).json({ message: "Cập nhật thành công!", profile: updatedProfile });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái hồ sơ:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const { cvFileIds } = req.body;

    if (!Array.isArray(cvFileIds) || cvFileIds.length === 0) {
      return res.status(400).json({ message: 'cvFileIds không hợp lệ hoặc rỗng.' });
    }

    // 1. Tìm tất cả CvFile theo _id
    const cvFiles = await CvFile.find({ _id: { $in: cvFileIds } });

    // 2. Lấy danh sách user_id từ CvFile
    const userIds = cvFiles.map(file => file.uploadedBy).filter(Boolean);

    if (userIds.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user_id nào từ cvFileIds đã cung cấp.' });
    }

    // 3. Tìm tất cả profile có user_id tương ứng
    const profiles = await Profile.find({ user_id: { $in: userIds } })
      .populate('user_id'); // Populate thông tin user

    // 4. Gắn danh sách CV file vào từng profile tương ứng
    const profilesWithCVs = profiles.map(profile => {
      const userCvFiles = cvFiles.filter(file => String(file.uploadedBy) === String(profile.user_id._id));
      return {
        ...profile.toObject(),
        cv_files: userCvFiles, // thêm thuộc tính mới chứa danh sách file
      };
    });

    return res.status(200).json(profilesWithCVs);
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách profile:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
