const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const UserRouter = require('../routers/User'); // Đường dẫn đến model User
const express = require('express');

const app = express();
app.use(express.json());
app.use('/api/users', UserRouter);
const User = require('../models/User'); // Đường dẫn đến model User

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

describe('POST /api/users/login', () => {
    it('should log in successfully with valid credentials', async () => {
        const password = 'P@ssw0rd123!';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username: 'testuser',
            password: hashedPassword,
            email: 'testuser@example.com',
            role: 'applicant',
            state: 'pending',
        });
        await user.save();

        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'testuser@example.com', password });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Đăng nhập thành công');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('role', 'applicant');
    });

    it('should return 400 if email does not exist', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'nonexistent@example.com', password: 'P@ssw0rd123!' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Email hoặc mật khẩu không hợp lệ');
    });

    it('should return 403 if the account is rejected', async () => {
        const password = 'P@ssw0rd123!';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username: 'suspendeduser',
            password: hashedPassword,
            email: 'suspended@example.com',
            role: 'applicant',
            state: 'rejected',
        });
        await user.save();

        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'suspended@example.com', password });

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('message', 'Tài khoản đã bị vô hiệu hóa');
    });

    it('should return 400 if password is incorrect', async () => {
        const password = 'P@ssw0rd123!';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username: 'testuser',
            password: hashedPassword,
            email: 'testuser@example.com',
            role: 'applicant',
            state: 'pending',
        });
        await user.save();

        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'testuser@example.com', password: 'wrongpassword' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Mật khẩu hoặc email không hợp lệ');
    });

    it('should return 500 if there is a server error', async () => {
        jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'testuser@example.com', password: 'P@ssw0rd123!' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Lỗi server');
    });
});
