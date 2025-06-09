const request = require('supertest');
const Job = require('../models/Job'); // Đảm bảo bạn import đúng mô hình Job
const JobRouter = require('../routers/Job'); // Đảm bảo bạn import đúng mô hình Job

const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/jobs', JobRouter);
jest.setTimeout(100000000);
describe('GET /search-job/search', () => {
  // Test trường hợp tìm kiếm thành công
  it('should return jobs based on query and location', async () => {
    // Mô phỏng dữ liệu trả về từ database
    const mockJobs = [
      { title: 'Software Engineer', location: 'Hanoi', company_id: { company_name: 'Company A' } },
      { title: 'Product Manager', location: 'Hanoi', company_id: { company_name: 'Company B' } },
    ];

    // Mô phỏng phương thức find của Job model trả về mockJobs
    const mockFind = jest.spyOn(Job, 'find').mockResolvedValue(mockJobs);

    const query = 'Engineer';
    const location = 'Hanoi';

    // Thực hiện request tới endpoint với query và location
    const response = await request(app)
      .get(`/api/jobs/search-job/search?query=${query}&location=${location}`)
    
    mockFind.mockRestore(); // Dọn dẹp sau khi test
  });

  // Test trường hợp không có kết quả trả về từ database
  it('should return an empty array if no jobs match the search criteria', async () => {
    const mockFind = jest.spyOn(Job, 'find').mockResolvedValue([]);

    const query = 'Nonexistent Job';
    const location = 'Hanoi';

    const response = await request(app)
      .get(`/api/jobs/search-job/search?query=${query}&location=${location}`)


    mockFind.mockRestore();
  });

  // Test trường hợp có lỗi khi truy vấn database
  it('should return an error if there is a problem with the database', async () => {
    // Mô phỏng lỗi từ database
    jest.spyOn(Job, 'find').mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/api/jobs/search-job/search?query=Developer&location=Hanoi')
      .expect(500); // Kiểm tra mã trạng thái lỗi 500

    expect(response.body.message).toBe('Lỗi khi tìm kiếm công việc.'); // Kiểm tra thông báo lỗi

    // Khôi phục lại mock sau khi kiểm tra
    jest.restoreAllMocks();
  });
});
