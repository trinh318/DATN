const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Company = require('../models/Company');
const Profile = require('../models/Profile');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const {
            username,
            password,
            email,
            phone,
            first_name,
            last_name,
            company_name,
            industry,
            location,
        } = req.body;

        // Kiểm tra tài khoản đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        // Kiểm tra username đã tồn tại
        const existingUserName = await User.findOne({ username });
        if (existingUserName) {
        return res.status(400).json({ message: 'Username đã tồn tại.' });
        }
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới với các giá trị trống nếu không được cung cấp
        const user = new User({
            username: username || '',
            password: hashedPassword,
            role: 'recruiter', // Mặc định là recruiter
            email: email || '',
            phone: phone || '',
            avatar: '', // Set trống
            state: 'pending', // Gán giá trị trạng thái là pending
            created_at: new Date(),
            updated_at: new Date(),
        });

        // Lưu người dùng
        const savedUser = await user.save();

        // Tạo profile với các giá trị trống nếu không được cung cấp
        const profile = new Profile({
            user_id: savedUser._id,
            first_name: first_name || '',
            last_name: last_name || '',
            email: email || '',
            phone: phone || '',
            gender: '',
            nationality: '',
            date_of_birth: null,
            location: '',
            specific_address: '',
            job_title: '',
            job_level: '',
            current_industry: '',
            current_field: '',
            years_of_experience: 0,
            current_salary: 0,
            desired_work_location: '',
            desired_salary: 0,
            education: '',
            experience: [],
            skills: [],
            cv_files: [],
            state: 'undefined', // Gán giá trị trạng thái là undefined
        });

        // Lưu profile
        await profile.save();

        // Tạo company với các giá trị trống nếu không được cung cấp
        const company = new Company({
            user_id: savedUser._id,
            company_name: company_name || '',
            industry: industry || '',
            location: location || '',
            description: '',
            specific_address: '',
            website: '',
            logo: '',
            banner: '',
            quymo: '',
            created_at: new Date(),
            updated_at: new Date(),
        });

        // Lưu company
        await company.save();

        // Trả về phản hồi thành công
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;
