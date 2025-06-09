const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const UserRouter = require('../routers/User'); // Đảm bảo đường dẫn chính xác tới file user.js trong routers

// Khởi tạo ứng dụng Express
const app = express();
app.use(express.json());
app.use('/api/users', UserRouter);

const User = require('../models/User'); // Đảm bảo đường dẫn chính xác tới file model user.js

let mongoServer;

// Tăng timeout Jest lên 30 giây
jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase(); // Xóa toàn bộ dữ liệu trước mỗi test
});

describe('POST /api/users/register', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      username: 'newuser',
      password: 'P@ssw0rd123!',
      role: 'applicant',
      email: 'newuser@example.com',
      phone: '1234567890',
      avatar: 'avatar.png',
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Đăng ký thành công!');
  });

  it('should return 400 if email already exists', async () => {
    const userData = {
      username: 'existinguser',
      password: 'P@ssw0rd123!',
      role: 'applicant',
      email: 'existing@example.com',
      phone: '1234567890',
      avatar: 'avatar.png',
    };

    // Đầu tiên, tạo người dùng với email đã tồn tại
    await request(app)
      .post('/api/users/register')
      .send(userData);

    // Thử đăng ký người dùng với email trùng
    const response = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Email đã tồn tại');
  });

  it('should return 400 if username already exists', async () => {
    const userData = {
      username: 'duplicateuser',
      password: 'P@ssw0rd123!',
      role: 'applicant',
      email: 'newuser@example.com',
      phone: '1234567890',
      avatar: 'avatar.png',
    };

    // Đầu tiên, tạo người dùng với username đã tồn tại
    await request(app)
      .post('/api/users/register')
      .send(userData);

    // Thử đăng ký người dùng với username trùng
    const response = await request(app)
      .post('/api/users/register')
      .send({
        username: 'duplicateuser',
        password: 'AnotherPassword123!',
        role: 'applicant',
        email: 'anotheruser@example.com',
        phone: '0987654321',
        avatar: 'anotheravatar.png',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Username đã tồn tại.');
  });

  it('should return 500 if there is a server error', async () => {
    // Mock lỗi server
    jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Server error');
    });

    const userData = {
      username: 'testuser',
      password: 'P@ssw0rd123!',
      role: 'applicant',
      email: 'testuser@example.com',
      phone: '1234567890',
      avatar: 'avatar.png',
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Server error');
  });
});
