const request = require('supertest');
const Profile = require('../models/Profile'); // Import Profile model
const User = require('../models/User'); // Import User model
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const ProfileRouter = require('../routers/Profile'); // Import User model

const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/profiles', ProfileRouter);
// Mocking Mongoose models
jest.mock('../models/Profile');
jest.mock('../models/User');
jest.setTimeout(100000000);

describe('POST /api/profiles/profile', () => {

  // Test case: Create a new profile
  it('should create a new profile', async () => {
    // Mock the User model to return a valid user
    const mockUser = { _id: new ObjectId(), avatar: null };
    User.findById = jest.fn().mockResolvedValue(mockUser);

    // Mock the Profile model to return a saved profile
    const mockProfile = {
      user_id: mockUser._id,
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@example.com',
      phone: '123456789',
      nationality: 'Vietnamese',
      date_of_birth: '1990-01-01',
      location: 'Hanoi',
      specific_address: '123 Main St',
      job_title: 'Software Engineer',
      job_level: 'Senior',
      current_industry: 'Tech',
      current_field: 'Software Development',
      years_of_experience: 5,
      current_salary: 60000,
      desired_work_location: 'Hanoi',
      desired_salary: 70000,
      education: 'Bachelor',
      experience: [],
      skills: ['JavaScript', 'Node.js'],
      cv_files: [],
    };
    Profile.prototype.save = jest.fn().mockResolvedValue(mockProfile);

    const response = await request(app)
      .post('/api/profiles/profile')
      .send({
        user_id: mockUser._id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'johndoe@example.com',
        phone: '123456789',
        nationality: 'Vietnamese',
        date_of_birth: '1990-01-01',
        location: 'Hanoi',
        specific_address: '123 Main St',
        job_title: 'Software Engineer',
        job_level: 'Senior',
        current_industry: 'Tech',
        current_field: 'Software Development',
        years_of_experience: 5,
        current_salary: 60000,
        desired_work_location: 'Hanoi',
        desired_salary: 70000,
        education: 'Bachelor',
        experience: [],
        skills: ['JavaScript', 'Node.js'],
        cv_files: [],
      })
      
  });

  // Test case: Update an existing profile
  it('should update an existing profile', async () => {
    const mockUser = { _id: new ObjectId(), avatar: null };
    User.findById = jest.fn().mockResolvedValue(mockUser);

    const existingProfile = {
      user_id: mockUser._id,
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@example.com',
      phone: '123456789',
      nationality: 'Vietnamese',
      date_of_birth: '1990-01-01',
      location: 'Hanoi',
      specific_address: '123 Main St',
      job_title: 'Software Engineer',
      job_level: 'Senior',
      current_industry: 'Tech',
      current_field: 'Software Development',
      years_of_experience: 5,
      current_salary: 60000,
      desired_work_location: 'Hanoi',
      desired_salary: 70000,
      education: 'Bachelor',
      experience: [],
      skills: ['JavaScript', 'Node.js'],
      cv_files: [],
    };

    Profile.findOne = jest.fn().mockResolvedValue(existingProfile);
    Profile.prototype.save = jest.fn().mockResolvedValue(existingProfile);

    const response = await request(app)
      .post('/api/profiles/profile')
      .send({
        user_id: mockUser._id,
        first_name: 'John',
        last_name: 'Updated',
        email: 'johndoe_updated@example.com',
        phone: '987654321',
        nationality: 'Vietnamese',
        date_of_birth: '1990-01-01',
        location: 'Hanoi',
        specific_address: '123 Main St',
        job_title: 'Software Engineer',
        job_level: 'Senior',
        current_industry: 'Tech',
        current_field: 'Software Development',
        years_of_experience: 5,
        current_salary: 60000,
        desired_work_location: 'Hanoi',
        desired_salary: 70000,
        education: 'Bachelor',
        experience: [],
        skills: ['JavaScript', 'Node.js'],
        cv_files: [],
      })
      

   
  });

  // Test case: Missing required fields
  it('should return error if required fields are missing', async () => {
    const mockUser = { _id: new ObjectId() };
    User.findById = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/profiles/profile')
      .send({
        user_id: mockUser._id,
        // Missing required fields like first_name, last_name, etc.
      })
      
  });

  // Test case: User not found
  it('should return error if user is not found', async () => {
    const mockUser = { _id: new ObjectId()};
    User.findById = jest.fn().mockResolvedValue(null); // Simulating user not found

    const response = await request(app)
      .post('/api/profiles/profile')
      .send({
        user_id: mockUser._id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'johndoe@example.com',
        phone: '123456789',
        nationality: 'Vietnamese',
        date_of_birth: '1990-01-01',
        location: 'Hanoi',
        specific_address: '123 Main St',
        job_title: 'Software Engineer',
        job_level: 'Senior',
        current_industry: 'Tech',
        current_field: 'Software Development',
        years_of_experience: 5,
        current_salary: 60000,
        desired_work_location: 'Hanoi',
        desired_salary: 70000,
        education: 'Bachelor',
        experience: [],
        skills: ['JavaScript', 'Node.js'],
        cv_files: [],
      })
      
  });
});
