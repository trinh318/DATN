const request = require('supertest');
const Job = require('../models/Job'); // The Job model
const User = require('../models/User'); // The User model
const Invitation = require('../models/Invitation'); // The Invitation model
const Notification = require('../models/Notification'); // The Notification model
const JobRouter = require('../routers/Invitation'); // The Notification model

const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/invitation', JobRouter);
jest.mock('../models/Job'); // Mock Job model
jest.mock('../models/User'); // Mock User model
jest.mock('../models/Invitation'); // Mock Invitation model
jest.mock('../models/Notification'); // Mock Notification model

describe('POST /api/invitation', () => {
  let jobId, recruiterId, candidateId, message;

  beforeEach(() => {
    jobId = '60c72b2f9f1b2c001f8d2c8a'; // Example job ID
    recruiterId = '60c72b2f9f1b2c001f8d2c8b'; // Example recruiter ID
    candidateId = '60c72b2f9f1b2c001f8d2c8c'; // Example candidate ID
    message = 'You are invited to apply for this job';
  });

  test('should successfully create an invitation', async () => {
    // Mock the models to simulate a valid scenario
    Job.findById = jest.fn().mockResolvedValue({ title: 'Software Engineer' }); // Mock job
    User.findById = jest.fn().mockResolvedValue({ _id: recruiterId }); // Mock recruiter
    User.findById = jest.fn().mockResolvedValue({ _id: candidateId }); // Mock candidate
    Invitation.findOne = jest.fn().mockResolvedValue(null); // No existing invitation
    Notification.prototype.save = jest.fn().mockResolvedValue({}); // Mock saving notification
    Invitation.prototype.save = jest.fn().mockResolvedValue({}); // Mock saving invitation

    const response = await request(app)
      .post('/api/invitation')
      .send({
        jobId,
        recruiterId,
        candidateId,
        message,
      });

    
  });

  test('should return 404 if Job, Recruiter, or Candidate not found', async () => {
    // Mock that the job is not found
    Job.findById = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .post('/api/invitation')
      .send({
        jobId,
        recruiterId,
        candidateId,
        message,
      });

    // Assert 404 Not Found
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Job, Recruiter, or Candidate not found');
  });

  test('should return 400 if the invitation is already pending', async () => {
    // Mock that the invitation already exists
    Invitation.findOne = jest.fn().mockResolvedValue({
      jobId,
      recruiterId,
      candidateId,
      status: 'pending',
    });

    const response = await request(app)
      .post('/api/invitation')
      .send({
        jobId,
        recruiterId,
        candidateId,
        message,
      });
  });

  test('should return 500 if there is a server error', async () => {
    // Simulate a server error
    Job.findById = jest.fn().mockRejectedValue(new Error('Server error'));

    const response = await request(app)
      .post('/api/invitation')
      .send({
        jobId,
        recruiterId,
        candidateId,
        message,
      });

    // Assert 500 Internal Server Error
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');
  });
});
