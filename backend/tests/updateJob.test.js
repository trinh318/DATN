const request = require('supertest');
const Job = require('../models/Job'); // The Job model
const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');
const JobRouter = require('../routers/Job');

const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/jobs', JobRouter);
jest.mock('../models/Job'); // Mock Job model
jest.mock('../models/SavedJob'); // Mock SavedJob model
jest.mock('../models/Notification'); // Mock Notification model

describe('PUT /api/jobs/:id', () => {
  let jobId;

  beforeEach(() => {
    jobId = '60c72b2f9f1b2c001f8d2c8a'; // Use a fixed job ID for testing
  });
  test('should update job and send notifications to saved users', async () => {
    // Mock finding a job
    const mockJob = {
      _id: jobId,
      title: 'Old Job',
      description: 'Old description',
      skills: ['JavaScript'],
      qualifications: ['Bachelor\'s Degree'],
      benefits: ['Health Insurance'],
      salary: '1000-2000',
      application_deadline: '2024-12-31',
      save: jest.fn().mockResolvedValue({}),
    };
    Job.findById = jest.fn().mockResolvedValue(mockJob);

    // Mock finding saved users
    SavedJob.find = jest.fn().mockResolvedValue([{ user_id: '12345' }]);

    // Mock creating notifications
    Notification.insertMany = jest.fn().mockResolvedValue([{ _id: '1', message: 'Job updated' }]);

    const jobData = {
      title: 'Updated Job',
      description: 'New job description',
      skills: ['JavaScript', 'Node.js'],
      qualifications: ['Master\'s Degree'],
      benefits: ['Health Insurance', 'Bonus'],
      salary: '1500-3000',
      application_deadline: '2025-01-01',
    };

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .send(jobData);

    // Ensure notification is created for saved users
    
  });

  test('should return 404 if job does not exist', async () => {
    // Mock Job not found
    Job.findById = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .send({
        title: 'Updated Job',
        description: 'New description',
        skills: ['JavaScript'],
        qualifications: ['Bachelor\'s Degree'],
        benefits: ['Health Insurance'],
        salary: '1000-2000',
        application_deadline: '2024-12-31',
      });

   
  });

  test('should return 500 if there is a server error', async () => {
    // Mock server error
    Job.findById = jest.fn().mockRejectedValue(new Error('Server error'));

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .send({
        title: 'Updated Job',
        description: 'New description',
        skills: ['JavaScript'],
        qualifications: ['Bachelor\'s Degree'],
        benefits: ['Health Insurance'],
        salary: '1000-2000',
        application_deadline: '2024-12-31',
      });

    
  });
});
