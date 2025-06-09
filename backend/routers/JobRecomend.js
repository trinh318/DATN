const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Academic = require('../models/Academic');
const Experience = require('../models/Experience');
const Company = require('../models/Company');
const Moderation = require('../models/Moderation');
const faissService = require('../services/faiss');

// Initialize FAISS index and update job vectors periodically
const VECTOR_DIMENSION = 1000; // Adjust based on your TF-IDF vector size
let isInitialized = false;

// Initialize FAISS service
const initializeFaiss = async () => {
  try {
    console.log('Start FAISS initialization...');
    const result = await faissService.initialize(VECTOR_DIMENSION);
    if (result) {
      isInitialized = true;
      console.log('FAISS initialized successfully');

      // After initialization, update job vectors
      await updateJobVectors();

      // Schedule regular updates (every hour)
      setInterval(updateJobVectors, 3600000);

      return true;
    } else {
      console.error('Failed to initialize FAISS');
      return false;
    }
  } catch (error) {
    console.error('Error initializing FAISS:', error);
    return false;
  }
};

// Update job vectors in FAISS index
const updateJobVectors = async () => {
  try {
    if (!isInitialized) {
      console.warn('Cannot update job vectors - FAISS not initialized');
      return false;
    }

    console.log('Updating job vectors in FAISS index...');

    // Get all approved jobs from MongoDB
    const jobs = await Job.find({
      status: 'open',
      application_deadline: { $gt: new Date() } // Only jobs with future deadline
    })
      .populate({
        path: 'moderation',
        match: { status: 'approved' } // Only jobs that have been approved
      });

    // Filter out jobs without moderation
    const approvedJobs = jobs.filter(job => job.moderation);

    console.log(`Found ${approvedJobs.length} approved and active jobs in MongoDB`);

    if (approvedJobs.length > 0) {
      // Add job vectors to FAISS index
      const result = await faissService.addJobVectors(approvedJobs);
      if (result) {
        console.log('Job vectors updated successfully in FAISS index');
        return true;
      } else {
        console.warn('Failed to update job vectors in FAISS index');
        return false;
      }
    } else {
      console.warn('No approved jobs found in MongoDB');
      return false;
    }
  } catch (error) {
    console.error('Error updating job vectors:', error);
    return false;
  }
};

// Initialize FAISS on startup (only once)
// Use an immediately invoked async function to properly handle the initialization
(async () => {
  try {
    console.log('Starting FAISS initialization process...');
    const initialized = await initializeFaiss();
    if (initialized) {
      console.log('FAISS initialization and job vector update complete.');
    } else {
      console.error('FAISS initialization failed.');
    }
  } catch (error) {
    console.error('Error during FAISS initialization process:', error);
  }
})();

// API route for job recommendations
router.post('/recommend-jobs', async (req, res) => {
  try {
    await faissService.initialize();

    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        recommendedJobs: []
      });
    }

    // Check if FAISS is initialized
    if (!isInitialized) {
      return res.status(503).json({
        success: false,
        message: 'Recommendation system is initializing. Please try again later.',
        recommendedJobs: []
      });
    }

    // Get user profile from MongoDB
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        recommendedJobs: []
      });
    }

    // Get academic and experience data
    const academicRecords = await Academic.find({ user_id: userId });
    const experienceRecords = await Experience.find({ userId });

    // Enhance user profile with academic and experience data
    const enhancedProfile = {
      ...profile.toObject(),
      degrees: academicRecords.map(record => record.degree),
      detailedExperience: experienceRecords.map(record =>
        `${record.position} at ${record.company} (${record.startMonth} to ${record.endMonth}) ${record.describe}`
      ).join(' ')
    };

    console.log(`Finding job recommendations for user: ${userId}`);

    // Get similar jobs using FAISS
    const similarJobs = await faissService.searchSimilarJobs(enhancedProfile, 20); // Get more results initially for filtering

    if (!similarJobs || similarJobs.length === 0) {
      return res.json({
        success: true,
        message: 'No job recommendations found',
        recommendedJobs: []
      });
    }

    console.log(`Found ${similarJobs.length} potential similar jobs using FAISS`);

    // Fetch full job details from MongoDB and ensure they are approved
    const recommendedJobs = await Promise.all(
      similarJobs.map(async ({ jobId, similarity }) => {
        try {
          // Find job by ID
          const job = await Job.findById(jobId);
          if (!job) return null;

          // Check if job is open and has future deadline
          const now = new Date();
          const deadline = new Date(job.application_deadline);
          if (job.status !== 'open' || deadline <= now) {
            return null;
          }

          // Check if job is approved by moderation
          const moderation = await Moderation.findOne({
            job_id: jobId,
            status: 'approved'
          });

          if (!moderation) {
            return null;
          }

          // Get company details
          const company = await Company.findById(job.company_id);

          return {
            jobId: job._id,
            jobTitle: job.title,
            companyId: job.company_id,
            companyName: company ? company.company_name : 'Unknown Company',
            companyLogo: company ? company.logo : null,
            jobDescription: job.description,
            location: job.location,
            salary: job.salary,
            skills: job.skills,
            application_deadline: job.application_deadline,
            similarity: parseFloat(similarity.toFixed(4))
          };
        } catch (error) {
          console.error(`Error fetching details for job ${jobId}:`, error);
          return null;
        }
      })
    ).then(jobs => jobs.filter(Boolean)); // Remove null values

    console.log(`Returning ${recommendedJobs.length} approved job recommendations`);

    res.json({
      success: true,
      message: `Found ${recommendedJobs.length} job recommendations`,
      recommendedJobs
    });
  } catch (error) {
    console.error('Error in job recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended jobs',
      recommendedJobs: []
    });
  }
});

module.exports = router;
