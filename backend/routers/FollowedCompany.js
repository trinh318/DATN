const express = require('express');
const router = express.Router();
const FollowedCompany = require('../models/FollowedCompany');
const User = require('../models/User');
const Company = require('../models/Company');
const authenticateToken = require('../middleware/authenticateToken');  // Đảm bảo middleware authenticateToken đã được import

// POST - Theo dõi một công ty
router.post('/', authenticateToken, async (req, res) => {
  const { company_id } = req.body;  // Get company_id from the request body
  const user_id = req.userId;  // Get user_id from the authenticated token

  try {
    // Kiểm tra xem công ty đã được theo dõi hay chưa
    const existingFollow = await FollowedCompany.findOne({ user_id, company_id });

    if (existingFollow) {
      return res.status(400).json({ message: 'Bạn đã theo dõi công ty này rồi' });
    }

    // Tạo mới một bản ghi theo dõi công ty
    const newFollow = new FollowedCompany({
      user_id,
      company_id,
    });

    await newFollow.save();
    res.status(201).json({ message: 'Theo dõi công ty thành công', followedCompany: newFollow });
  } catch (error) {
    console.error('Error following company:', error);
    res.status(500).json({ message: 'Lỗi server khi theo dõi công ty', error });
  }
});
router.get('/followed-companies/:userId', async (req, res) => {
  const { userId } = req.params; // Lấy userId từ params trong URL

  try {
    // Tìm tất cả các bản ghi trong FollowedCompany mà user_id trùng với userId
    const followedCompanies = await FollowedCompany.find({ user_id: userId })
      .populate('company_id') // Dùng populate để lấy thông tin chi tiết về công ty
      .exec();

    // Nếu không tìm thấy công ty nào
    if (!followedCompanies.length) {
      return res.status(404).json({ message: 'No followed companies found' });
    }

    // Lấy mảng các công ty
    const companies = followedCompanies.map(followedCompany => followedCompany.company_id);

    // Trả về danh sách công ty
    return res.status(200).json(companies);
  } catch (err) {
    console.error("Error fetching followed companies:", err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:userId/:companyId', async (req, res) => {
  const { userId, companyId } = req.params;

  try {
    // Tìm và xóa bản ghi FollowedCompany
    const result = await FollowedCompany.findOneAndDelete({
      user_id: userId,
      company_id: companyId
    });

    if (!result) {
      return res.status(404).json({ message: 'Followed company not found' });
    }

    return res.status(200).json({ message: 'Unfollowed company successfully' });
  } catch (err) {
    console.error("Error unfollowing company:", err);
    return res.status(500).json({ message: 'Server error' });
  }
});



// DELETE - Hủy theo dõi một công ty
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.userId;  // Lấy user_id từ token

  try {
    // Tìm FollowedCompany bằng ID
    const followedCompany = await FollowedCompany.findById(req.params.id);

    console.log('Followed Company:', followedCompany);  // Kiểm tra đối tượng FollowedCompany

    // Kiểm tra xem công ty đã được theo dõi hay chưa
    if (!followedCompany) {
      return res.status(404).json({ message: 'Không tìm thấy công ty đã theo dõi.' });
    }

    // Kiểm tra xem trường user_id có hợp lệ hay không
    if (!followedCompany.user_id) {
      return res.status(400).json({ message: 'Không tìm thấy thông tin người dùng trong công ty đã theo dõi.' });
    }

    // Kiểm tra xem công ty có thuộc về người dùng hiện tại không
    if (followedCompany.user_id.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không thể hủy theo dõi công ty này.' });
    }

    // Xóa công ty khỏi danh sách theo dõi
    await FollowedCompany.findByIdAndDelete(req.params.id);

    res.json({ message: 'Công ty đã được hủy theo dõi thành công' });
  } catch (error) {
    console.error('Error while unfollowing company:', error);  // Log lỗi
    res.status(500).json({ message: 'Lỗi server khi hủy theo dõi', error: error.message || error });
  }
});

// GET - Lấy danh sách tất cả các công ty
router.get('/allcompanies', authenticateToken, async (req, res) => {
  try {
    // Truy vấn tất cả các công ty từ bảng Company
    const companies = await Company.find(); 

    // Trả về danh sách các công ty
    res.json(companies);
  } catch (error) {
    console.error('Error fetching all companies:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách công ty', error });
  }
});

// Route để lấy danh sách các userId theo dõi một công ty
router.get('/company/:companyId/followers', async (req, res) => {
  try {
    const { companyId } = req.params;  // Lấy companyId từ tham số URL

    console.log("company id: ", companyId);
    // Tìm tất cả bản ghi theo dõi công ty này, chỉ lấy user_id
    const followedUsers = await FollowedCompany.find({ company_id: companyId }).select('user_id');  // Sử dụng .select để chỉ lấy user_id

    // Lấy danh sách user_id từ các bản ghi
    const userIds = followedUsers.map(followed => followed.user_id);  // Chỉ lấy user_id

    res.json({ userIds });
  } catch (error) {
    console.error('Error fetching followed users:', error);
    res.status(500).json({ message: 'Failed to fetch followers.' });
  }
});


// Route kiểm tra người dùng có đang theo dõi công ty hay không
router.get('/check-followed/:companyId', authenticateToken, async (req, res) => {
  const userId = req.userId; // Lấy userId từ token
  const { companyId } = req.params; // Lấy companyId từ URL
  console.log("user-company", userId, companyId);
  try {
    // Kiểm tra xem người dùng đã theo dõi công ty này hay chưa
    const existingFollow = await FollowedCompany.findOne({ user_id: userId, company_id: companyId });

    // Nếu tìm thấy bản ghi theo dõi, trả về true, ngược lại trả về false
    if (existingFollow) {
      return res.status(200).json({ isFollowed: true });
    } else {
      return res.status(200).json({ isFollowed: false });
    }
  } catch (err) {
    console.error("Error checking follow status:", err);
    return res.status(500).json({ message: 'Error checking follow status' });
  }
});

module.exports = router;  // Only export once
