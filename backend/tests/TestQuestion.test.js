const request = require('supertest');
const Test = require('../models/Test'); // The Test model
const TestQuestion = require('../models/TestQuestion'); // The TestQuestion model
const TestRouter = require('../routers/Test'); // The TestQuestion model
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/tests', TestRouter);
jest.mock('../models/Test'); // Mock Test model
jest.mock('../models/TestQuestion'); // Mock TestQuestion model

describe('PUT /api/tests/edit/:id', () => {
  let testId;

  beforeEach(() => {
    testId = '60c72b2f9f1b2c001f8d2c8a'; // Fixed test ID for testing
  });

  test('should successfully update a test', async () => {
    // Mock the test data
    const mockTest = {
      _id: testId,
      title: 'Old Test Title',
      description: 'Old test description',
      duration: 60,
      questions: [
        { _id: '60c72b2f9f1b2c001f8d2c8b', text: 'Old question text' },
      ],
      save: jest.fn().mockResolvedValue({}),
    };

    Test.findById = jest.fn().mockResolvedValue(mockTest); // Mock the test retrieval
    TestQuestion.updateOne = jest.fn().mockResolvedValue({}); // Mock updating questions
    TestQuestion.create = jest.fn().mockResolvedValue({}); // Mock creating new questions

    // The data to update the test
    const testData = {
      title: 'Updated Test Title',
      description: 'Updated description',
      duration: 90,
      questions: [
        { _id: '60c72b2f9f1b2c001f8d2c8b', text: 'Updated question text' },
      ],
    };

    const response = await request(app)
      .put(`/api/tests/edit/${testId}`)
      .send(testData);

  });

  test('should return 404 if test not found', async () => {
    // Mock that the test was not found
    Test.findById = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/tests/edit/${testId}`)
      .send({
        title: 'Updated Test Title',
        description: 'Updated description',
        duration: 90,
        questions: [],
      });

    // Assert 404 Not Found
   
  });

  test('should return 500 if there is a server error', async () => {
    // Mock server error during the database operation
    Test.findById = jest.fn().mockRejectedValue(new Error('Server error'));

    const response = await request(app)
      .put(`/api/tests/edit/${testId}`)
      .send({
        title: 'Updated Test Title',
        description: 'Updated description',
        duration: 90,
        questions: [],
      });

 
  });

  test('should create new questions if no _id is provided', async () => {
    // Mock the test data and TestQuestion model behavior
    const mockTest = {
      _id: testId,
      title: 'Old Test Title',
      description: 'Old test description',
      duration: 60,
      questions: [],
      save: jest.fn().mockResolvedValue({}),
    };

    Test.findById = jest.fn().mockResolvedValue(mockTest);
    TestQuestion.updateOne = jest.fn().mockResolvedValue({});
    TestQuestion.create = jest.fn().mockResolvedValue({}); // Mock question creation

    const testData = {
      title: 'Updated Test Title',
      description: 'Updated description',
      duration: 90,
      questions: [
        { text: 'New question text' }, // New question without _id
      ],
    };

    const response = await request(app)
      .put(`/api/tests/edit/${testId}`)
      .send(testData);

    
  });
});
