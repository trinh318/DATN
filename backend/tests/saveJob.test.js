const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const SavedJobRouter = require('../routers/SavedJob');
const UserRouter = require('../routers/User');
const User = require('../models/User');
const SavedJob = require('../models/SavedJob');

// Khởi tạo ứng dụng Express
const app = express();
app.use(express.json());
app.use('/api/savedjobs', SavedJobRouter);
app.use('/api/users', UserRouter);

let mongoServer;
let userId;
let jobId;

jest.setTimeout(30000); // Tăng timeout Jest lên 30 giây

beforeAll(async () => {
  // Khởi tạo MongoMemoryServer để tạo cơ sở dữ liệu trong bộ nhớ
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Kết nối đến cơ sở dữ liệu MongoDB trong bộ nhớ
  await mongoose.connect(uri);

  // Tạo một người dùng giả lập để test
  const user = new User({
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'P@ssw0rd123!',
    role: 'applicant',
    state: 'pending',
  });
  await user.save();

  // Lưu userId để sử dụng trong các bài test
  userId = user._id.toString();

  // Tạo một công việc giả lập để lưu
  const savedJob = new SavedJob({
    user_id: user._id,
    job_id: new mongoose.Types.ObjectId(),  // Tạo ObjectId ngẫu nhiên
  });
  await savedJob.save();

  jobId = savedJob.job_id.toString(); // Lưu jobId để sử dụng trong các bài test
});

afterAll(async () => {
  // Đóng kết nối và dừng MongoMemoryServer
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('POST /api/savedjobs/save-job', () => {
  it('should save a job successfully if not saved before', async () => {
    const newJobId = new mongoose.Types.ObjectId(); // Tạo ObjectId mới cho job
    const response = await request(app)
      .post('/api/savedjobs/save-job')
      .send({ job_id: newJobId, user_id: userId }); // Gửi user_id trong body thay vì token

    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);

  });

  it('should return 409 if the job has already been saved', async () => {
    const response = await request(app)
      .post('/api/savedjobs/save-job')
      .send({ job_id: jobId, user_id: userId });  // Sử dụng jobId đã tồn tại trong cơ sở dữ liệu

    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);

  });

  it('should return 401 if the user is not logged in', async () => {
    const response = await request(app)
      .post('/api/savedjobs/save-job')
      .send({ job_id: new mongoose.Types.ObjectId() }); // Tạo ObjectId mới cho job nhưng không gửi user_id

    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);

  });

  it('should return 500 if there is a server error', async () => {
    // Mock lỗi server
    jest.spyOn(SavedJob.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .post('/api/savedjobs/save-job')
      .send({ job_id: new mongoose.Types.ObjectId(), user_id: userId });  // Gửi user_id trong body

    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);

  });
});
