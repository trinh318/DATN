const mongoose = require('mongoose');
const User = require('../models/User'); // Đường dẫn đến schema của bạn

// Kết nối tới MongoDB
mongoose.connect('mongodb://localhost:27017/hirepoint', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Dữ liệu mẫu
const seedUsers = [
  {
    username: 'admin@example.com',
    password: '$2b$10$KIXAwqzWpIeZ1HLjpVZ.UuQvFvMSkZ.BvlrtO/8LhxTx8WpZ8ojSG', // 'admin123' đã được mã hóa bằng bcrypt
    role: 'admin',
    email: 'admin@example.com',
    phone: '1234567890',
    avatar: 'https://example.com/avatar/admin.jpg',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    username: 'recruiter1@example.com',
    password: '$2b$10$KIXAwqzWpIeZ1HLjpVZ.UuQvFvMSkZ.BvlrtO/8LhxTx8WpZ8ojSG', // 'password123'
    role: 'recruiter',
    email: 'recruiter1@example.com',
    phone: '9876543210',
    avatar: 'https://example.com/avatar/recruiter1.jpg',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    username: 'applicant1@example.com',
    password: '$2b$10$KIXAwqzWpIeZ1HLjpVZ.UuQvFvMSkZ.BvlrtO/8LhxTx8WpZ8ojSG', // 'password123'
    role: 'applicant',
    email: 'applicant1@example.com',
    phone: '5555555555',
    avatar: 'https://example.com/avatar/applicant1.jpg',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Chèn dữ liệu vào cơ sở dữ liệu
const seedDB = async () => {
  try {
    // Xóa tất cả dữ liệu trước đó
    await User.deleteMany({});
    console.log('Existing users removed');

    // Chèn dữ liệu mới
    await User.insertMany(seedUsers);
    console.log('Seed data added successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Đóng kết nối MongoDB
    mongoose.connection.close();
  }
};

// Chạy seed
seedDB();
