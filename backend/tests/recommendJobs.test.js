const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Import router cần kiểm thử
const recommendJobsRouter = require('../routers/JobRecomend');

// Mock các model
jest.mock('../models/Profile');
jest.mock('../models/Job');
jest.mock('../models/Academic');
jest.mock('../models/Experience');
jest.mock('../models/Company');

const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Academic = require('../models/Academic');
const Experience = require('../models/Experience');
const Company = require('../models/Company');

// Tạo ứng dụng Express và tích hợp router
const app = express();
app.use(express.json());
app.use('/api/jobrecomend', recommendJobsRouter);

describe('POST /api/jobrecomend/recommend-jobs', () => {
    beforeAll(() => {
        mongoose.connect = jest.fn(); // Mock kết nối MongoDB
    });

    afterEach(() => {
        jest.clearAllMocks(); // Xóa các mock sau mỗi test case
    });

    it('should return recommended jobs for a valid userId', async () => {
        // Mock dữ liệu trả về từ các model
        Profile.findOne.mockResolvedValue({
            user_id: 'testUserId',
            skills: ['JavaScript', 'React'],
            job_title: 'Frontend Developer',
            desired_work_location: 'Hanoi',
            current_industry: 'IT',
            job_level: 'Junior',
            current_field: 'Web Development',
            years_of_experience: 2,
            desired_salary: '1000 USD',
            education: 'Bachelor',
            experience: ['Frontend Developer at XYZ'],
            location: 'Hanoi',
        });

        Job.find.mockResolvedValue([
            {
                _id: 'jobId1',
                description: 'Develop frontend applications',
                skills: ['JavaScript', 'React'],
                title: 'Frontend Developer',
                requirements: '2 years experience',
                qualifications: 'Bachelor',
                interview_location: 'Hanoi',
                salary: '1000 USD',
                location: 'Hanoi',
                note: '',
                benefits: 'Health insurance',
                status: 'open',
                company_id: 'companyId1',
            },
        ]);

        Academic.find.mockResolvedValue([
            { degree: 'Bachelor of Computer Science' },
        ]);

        Experience.find.mockResolvedValue([
            {
                position: 'Frontend Developer',
                company: 'XYZ',
                startMonth: '01-2022',
                endMonth: '12-2022',
                describe: 'Developed web applications',
            },
        ]);

        Company.findById.mockResolvedValue({
            _id: 'companyId1',
            company_name: 'XYZ Company',
            logo: 'xyz-logo.png',
        });

        // Gửi yêu cầu POST tới endpoint
        const response = await request(app)
            .post('/api/jobrecomend/recommend-jobs')
            .send({ userId: 'testUserId' });

        expect(response.status).toBe(200); // Kiểm tra status code
        expect(response.body.recommendedJobs).toHaveLength(1); // Đảm bảo có 1 công việc được gợi ý
        expect(response.body.recommendedJobs[0]).toMatchObject({
            jobId: 'jobId1',
            jobTitle: 'Frontend Developer',
            companyId: 'companyId1',
            companyName: 'XYZ Company',
            location: 'Hanoi',
            similarity: expect.any(Number), // Đảm bảo có trường similarity
        });
    });

    it('should return 404 if user profile is not found', async () => {
        // Mock Profile.findOne trả về null
        Profile.findOne.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/jobrecomend/recommend-jobs')
            .send({ userId: 'invalidUserId' });

        expect(response.status).toBe(404); // Kiểm tra status code
        expect(response.text).toBe('User profile not found'); // Kiểm tra thông báo lỗi
    });

    it('should return 500 if there is an internal server error', async () => {
        // Mock Profile.findOne để giả lập lỗi
        Profile.findOne.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/api/jobrecomend/recommend-jobs')
            .send({ userId: 'testUserId' });

        expect(response.status).toBe(500); // Kiểm tra status code
        expect(response.text).toBe('Error fetching recommended jobs'); // Kiểm tra thông báo lỗi
    });
});
