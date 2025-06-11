const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const FollowedCompany = require('../models/FollowedCompany');
const Job = require('../models/Job'); 
const moment = require('moment');

// Cấu hình multer để xử lý file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/newcompany', async (req, res) => {
  const { name, description, industry, location, website, logo, quymo } = req.body;

  // Kiểm tra nếu tất cả thông tin cần thiết đã có
  if (!name || !description || !industry || !location || !website || !logo || !quymo) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    const newCompany = new Company({
      name,
      description,
      industry,
      location,
      website,
      logo,
      quymo
    });

    // Lưu công ty vào cơ sở dữ liệu
    await newCompany.save();
    res.status(201).json({ message: 'Company added successfully' });
  } catch (error) {
    console.error('Error adding company:', error);
    res.status(500).json({ message: 'Error adding company' });
  }
});
router.get('/me/:followedUser', async (req, res) => {
  try {
    const { followedUser } = req.params;  // Lấy userId từ params
    console.log('followedUser:', followedUser);  // Log userId để kiểm tra

    // Truy vấn FollowedCompany để lấy các công ty mà người dùng đã theo dõi
    const follows = await FollowedCompany.find({ user_id: followedUser })
      .populate('company_id')  // Populate thông tin công ty (company_id) từ mô hình Company
      .exec();

    console.log('Follows:', follows);  // Log kết quả populate để kiểm tra

    if (!follows || follows.length === 0) {
      return res.status(404).json({ message: 'No companies followed' });
    }

    // Lấy danh sách công ty từ các follow và trả về kết quả
    const companies = follows.map(follow => follow.company_id);

    res.status(200).json({ success: true, companies });
  } catch (error) {
    console.error('Error fetching followed companies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// READ ALL - Lấy tất cả các công ty
router.get('/', async (req, res) => {
  try {
    // Get all companies
    const companies = await Company.find();

    // Get the current month's start and end date
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Fetch job count for each company
    const companiesWithJobCount = await Promise.all(companies.map(async (company) => {
      // Count jobs for the company for the current month
      const jobCount = await Job.countDocuments({
        company_id: company._id,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      return {
        ...company.toObject(),
        jobCount, // Add the job count to the company object
      };
    }));

    res.json(companiesWithJobCount);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy thông tin công ty theo ID
router.get('/company/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}); 

// Lấy thông tin công ty theo userID
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const company = await Company.findOne({ user_id }).populate('user_id'); // Populate if needed

    if (!company) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





// UPDATE - Cập nhật thông tin công ty
router.put('/:id', async (req, res) => {
  try {
    const { company_name, description, industry, location, specific_address,logo, banner, website, quymo } = req.body;
    console.log ('thong tin cong ty',req.body);
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      {
        company_name,
        description,
        industry,
        location,
        specific_address,
        website,
        logo,
        banner,
        quymo,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Cập nhật thành công!', company: updatedCompany });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE - Xóa công ty
router.delete('/:id', async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);
    if (!deletedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// SEARCH - Tìm kiếm công ty theo tên
router.get('/search-company/search', async (req, res) => {
  try {
    const { name } = req.query; // Lấy tên công ty từ query string

    if (!name) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên công ty để tìm kiếm.' });
    }

    // Tìm các công ty có tên chứa chuỗi được cung cấp (không phân biệt chữ hoa/thường)
    const companies = await Company.find({
      company_name: { $regex: name, $options: 'i' },
    });

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy công ty nào.' });
    }

    res.json(companies);
  } catch (error) {
    console.error('Error searching for companies:', error);
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm công ty.', error });
  }
});

///lấy tất cả công ty + số lượng jobs của công ty đó
// READ ALL - Lấy tất cả các công ty kèm số lượng công việc
router.get('/get-all-company/count-job', async (req, res) => {
  try {
    const today = new Date();
    const limit = 20;       // Số lượng kết quả trả về
    const topLimit = 100;   // Số lượng top để random

    const companies = await Company.aggregate([
      // Chỉ lấy công ty nổi bật
      {
        $match: {
          highlight: true,
          highlight_expiration: { $gte: today },
        },
      },
      // Đếm số lượng review để tính rating trung bình
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'company_id',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          avg_rating: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              { $avg: '$reviews.rating' },
              0,
            ],
          },
        },
      },
      // Đếm số lượng theo dõi
      {
        $lookup: {
          from: 'followedcompanies',
          localField: '_id',
          foreignField: 'company_id',
          as: 'followers',
        },
      },
      {
        $addFields: {
          follow_count: { $size: '$followers' },
        },
      },
      // Đếm số lượng job
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'company_id',
          as: 'jobs',
        },
      },
      {
        $addFields: {
          jobCount: { $size: '$jobs' },
        },
      },
      // Sắp xếp theo tiêu chí chất lượng
      {
        $sort: {
          avg_rating: -1,
          follow_count: -1,
          created_at: -1,
        },
      },
      { $limit: topLimit },
      { $sample: { size: limit } },
      {
        $project: {
          reviews: 0,
          followers: 0,
          jobs: 0,
        },
      },
    ]);

    console.log(companies)
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Lấy danh sách các công ty (id và tên công ty)
router.get('/companies/id-name', async (req, res) => {
  try {
    const companies = await Company.find({}, 'company_name _id').sort({ company_name: 1 });
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const GetBestCompany = async () => {
  const today = new Date();
  const limit = 20;       // Số lượng kết quả random trả về
  const topLimit = 100;   // Số lượng công ty tốt nhất trước khi random

  const bestCompanies = await Company.aggregate([
    {
      $match: {
        highlight: true,
        highlight_expiration: { $gte: today }
      }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'company_id',
        as: 'reviews'
      }
    },
    {
      $addFields: {
        avg_rating: {
          $cond: [
            { $gt: [{ $size: '$reviews' }, 0] },
            { $avg: '$reviews.rating' },
            0
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'followedcompanies',
        localField: '_id',
        foreignField: 'company_id',
        as: 'followers'
      }
    },
    {
      $addFields: {
        follow_count: { $size: '$followers' }
      }
    },
    {
      $sort: {
        avg_rating: -1,
        follow_count: -1,
        created_at: -1
      }
    },
    { $limit: topLimit },
    { $sample: { size: limit } },
    {
      $project: {
        reviews: 0,
        followers: 0
      }
    }
  ]);

  return bestCompanies;
};

router.get('/best', async (req, res) => {
  try {
    const companies = await GetBestCompany();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get best companies' });
  }
});

module.exports = router;