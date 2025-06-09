const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/authenticateToken');
const { sendVerificationEmail } = require('../helper/mailer'); // đường dẫn tới mailer.js

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// DANG KY
router.post('/register', async (req, res) => {
  try { 
    const { username, password, role, email, phone, avatar } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // Kiểm tra username đã tồn tại
    const existingUserName = await User.findOne({ username });
    if (existingUserName) {
      return res.status(400).json({ message: 'Username đã tồn tại.' });
    }
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const user = new User({
      username,
      password: hashedPassword,
      role,
      email,
      phone,
      avatar,
      state: 'pending', // Trạng thái mặc định là "pending"
      isGoogle: false,
      created_at: new Date(),
      updated_at: new Date()
    });

    await user.save();

    const token = jwt.sign({ email: user.email }, 'email-secret-key', { expiresIn: '1d' });
    const verificationLink = `http://localhost:5000/api/users/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verificationLink);
    res.status(201).json({ message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.' });

  } catch (error) {
    //console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Dữ liệu gửi lên:', req.body);

    // Kiểm tra người dùng với email
    const user = await User.findOne({ email });
    console.log('Tìm thấy user:', user);
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không hợp lệ' });
    }

    // Kiểm tra nếu tài khoản bị vô hiệu hóa
    if (user.state === 'rejected') {
      return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
    }
    if (user.state === 'pending') {
      return res.status(403).json({ message: 'Tài khoản đang được kiểm duyệt!' });
    }

    // So sánh mật khẩu người dùng nhập và mật khẩu đã mã hóa
    console.log('Mật khẩu nhập vào:', password);
    console.log('Mật khẩu từ database:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Kết quả so sánh mật khẩu:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hoặc email không hợp lệ' });
    }

    user.last_login = new Date();
    await user.save();

    // Tạo token và trả về cho người dùng
    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
    console.log("token: ", token);
    res.json({
      message: 'Đăng nhập thành công',
      token,
      userId: user._id,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

router.post('/facebook-login', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Tài khoản Facebook thiếu email' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isGoogle) {
        return res.status(400).json({
          message: 'Email của tài khoảng Facebook này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng tài khoản thông thường.'
        });
      }

      if (existingUser.state === 'rejected') {
        return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
      }
      if (existingUser.state === 'pending') {
        return res.status(403).json({ message: 'Tài khoản đang được kiểm duyệt!' });
      }

      existingUser.last_login = new Date();
      await existingUser.save();

      const token = jwt.sign({ userId: existingUser._id }, 'secretkey', { expiresIn: '1h' });

      return res.status(200).json({
        message: 'Đăng nhập thành công',
        token,
        userId: existingUser._id,
        role: existingUser.role,
      });
    }

    // Nếu chưa tồn tại, tạo mới tài khoản applicant
    const newUser = new User({
      username: email,
      password: email + "_facebook",
      email,
      role: 'applicant',
      phone: '',
      avatar: null,
      state: 'approved',
      isGoogle: true,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: new Date()
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, 'secretkey', { expiresIn: '1h' });

    res.status(201).json({
      message: 'Tạo tài khoản và đăng nhập thành công',
      token,
      userId: newUser._id,
      role: newUser.role,
    });

  } catch (error) {
    console.error('Facebook Login Error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.post('/google-login', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Thiếu email từ Google' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isGoogle) {
        return res.status(400).json({
          message: 'Email này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng tài khoản thông thường.'
        });
      }

      if (existingUser.state === 'rejected') {
        return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
      }
      if (existingUser.state === 'pending') {
        return res.status(403).json({ message: 'Tài khoản đang được kiểm duyệt!' });
      }

      existingUser.last_login = new Date();
      await existingUser.save();

      const token = jwt.sign({ userId: existingUser._id }, 'secretkey', { expiresIn: '1h' });

      return res.status(200).json({
        message: 'Đăng nhập thành công',
        token,
        userId: existingUser._id,
        role: existingUser.role,
      });
    }

    // Nếu chưa tồn tại, tạo mới tài khoản applicant
    const newUser = new User({
      username: email,
      password: email + "_google",
      email,
      role: 'applicant',
      phone: '',
      avatar: null,
      state: 'approved',
      isGoogle: true,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: new Date()
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, 'secretkey', { expiresIn: '1h' });

    res.status(201).json({
      message: 'Tạo tài khoản và đăng nhập thành công',
      token,
      userId: newUser._id,
      role: newUser.role,
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, 'email-secret-key');
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('Người dùng không tồn tại');
    }

    if (user.state === 'approved') {
      return res.send('Tài khoản đã được xác thực trước đó.');
    }

    user.state = 'approved';
    await user.save();

    res.send('Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay.');
  } catch (err) {
    console.error('Lỗi xác thực email:', err);
    res.status(400).send('Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
  }
});

// GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE USER
router.put('/:id', async (req, res) => {
  try {
    const { username, role, email, phone, avatar } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    let updatedFields = { username, role, email, phone, updated_at: new Date() };

    // Nếu có avatar mới, bao gồm nó vào trường cập nhật
    if (avatar) {
      updatedFields.avatar = avatar;
    }

    // Cập nhật thông tin người dùng mà không thay đổi mật khẩu
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    if (!updatedUser) {
      console.log('User not found with ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error during user update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// UPDATE USER
router.put('/avatar/:id', async (req, res) => {
  try {
    const { username, role, email, phone, avatar } = req.body;

    let updatedFields = { username, role, email, phone, updated_at: new Date() };

    // Nếu có avatar mới, bao gồm nó vào trường cập nhật
    if (avatar) {
      updatedFields.avatar = avatar;
    }

    // Cập nhật thông tin người dùng mà không thay đổi mật khẩu
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    if (!updatedUser) {
      console.log('User not found with ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error during user update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// DELETE USER
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
router.post('/logout', (req, res) => {
  try {
    // Clear the token cookie from the client's browser
    res.clearCookie('token', { path: '/' });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Cập nhật mật khẩu
router.put('/update-password/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Nếu không có mật khẩu cũ, mặc định là "1234"
    const passwordToCompare = oldPassword || '1234';  // Nếu không có mật khẩu cũ, dùng "1234"

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu mới và mật khẩu xác nhận không khớp.' });
    }

    // Tìm người dùng theo ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    // So sánh mật khẩu cũ (hoặc mật khẩu mặc định) với mật khẩu hiện tại
    let isMatch = false;
    if (passwordToCompare === '1234') {
      isMatch = true; // Nếu là mật khẩu mặc định "1234", bỏ qua so sánh
    } else {
      isMatch = await bcrypt.compare(passwordToCompare, user.password);  // So sánh với mật khẩu hiện tại
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới vào cơ sở dữ liệu
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Mật khẩu đã được cập nhật thành công.' });
  } catch (error) {
    console.error('Lỗi khi cập nhật mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});


router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log("id: ", req.userId)
    // Tìm người dùng trong cơ sở dữ liệu bằng userId từ token
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Trả về thông tin người dùng
    res.json({
      userId: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar
      // Có thể thêm các trường khác như địa chỉ, phone...
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//////////Lấy thông tin account
router.get('/account/all-accounts', async (req, res) => {
  try {
    console.log("hereeeeeeeee");

    // Tìm tất cả users và liên kết thông tin từ Profile
    const users = await User.find().lean(); // Sử dụng .lean() để trả về plain JavaScript object
    const profiles = await Profile.find().lean();

    // Kết hợp user với profile dựa trên `user_id` trong Profile
    const result = users.map(user => {
      const profile = profiles.find(profileItem => profileItem.user_id.toString() === user._id.toString());
      return {
        ...user,
        profile: profile || null // Nếu không có profile thì gán null
      };
    });

    console.log("account data: ", result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching users and profiles:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

//////////Lấy thông tin all applicant
router.get('/account/all-accounts/applicants', async (req, res) => {
  try {
    console.log("hereeeeeeeee");

    // Tìm tất cả users và liên kết thông tin từ Profile
    const users = await User.find({ role: 'applicant' }).lean(); // Lấy toàn bộ thông tin user
    const profiles = await Profile.find().lean();

    // Kết hợp user với profile dựa trên `user_id` trong Profile
    const result = users.map(user => {
      const profile = profiles.find(profileItem => profileItem.user_id.toString() === user._id.toString());
      return {
        ...user,
        profile: profile || null // Nếu không có profile thì gán null
      };
    });

    console.log("account data: ", result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching users and profiles:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

//////////Lấy thông tin all recruiter
router.get('/account/all-accounts/recruiters', async (req, res) => {
  try {
    console.log("hereeeeeeeee");

    // Tìm tất cả users và liên kết thông tin từ Profile
    const users = await User.find({ role: 'recruiter' }).lean(); // Lấy toàn bộ thông tin user
    const profiles = await Profile.find().lean();

    // Kết hợp user với profile dựa trên `user_id` trong Profile
    const result = users.map(user => {
      const profile = profiles.find(profileItem => profileItem.user_id.toString() === user._id.toString());
      return {
        ...user,
        profile: profile || null // Nếu không có profile thì gán null
      };
    });

    console.log("account data: ", result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching users and profiles:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// PUT route để cập nhật trạng thái người dùng
router.put('/admin/edit/:id', async (req, res) => {
  const userId = req.params.id;  // Lấy userId từ URL params
  const { state } = req.body;     // Lấy trạng thái người dùng từ request body

  // Kiểm tra trạng thái hợp lệ
  if (!['undefined', 'pending', 'approved', 'rejected'].includes(state)) {
    return res.status(400).send('Trạng thái không hợp lệ');
  }

  try {
    // Cập nhật trạng thái người dùng trong cơ sở dữ liệu
    const updatedUser = await User.findByIdAndUpdate(
      userId,                  // Tìm người dùng theo ID
      { state },                // Cập nhật trường state
      { new: true }             // Trả về bản ghi đã được cập nhật
    );

    if (!updatedUser) {
      return res.status(404).send('Không tìm thấy người dùng');
    }

    // Trả về thông tin người dùng đã được cập nhật
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
    res.status(500).send('Lỗi server');
  }
});

router.put('/update-user/:id', async (req, res) => {
  try {
    const { username, email, phone } = req.body;

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    // Cập nhật thông tin người dùng
    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    // Cập nhật thời gian 'updated_at' thành thời gian hiện tại
    user.updated_at = new Date();

    // Lưu thông tin đã cập nhật vào cơ sở dữ liệu
    await user.save();

    res.json({ message: 'Thông tin người dùng đã được cập nhật thành công.', user });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;