const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

const Profile = require('../models/Cv_profile');
const Education = require('../models/Cv_education');
const WorkExperience = require('../models/Cv_work_experience');
const Volunteering = require('../models/Cv_volunteering');
const Publication = require('../models/Cv_publication');
const Project = require('../models/Cv_project');
const Certification = require('../models/Cv_certification');
const Award = require('../models/Cv_award');
const Skill = require('../models/Cv_skill');
 
// Utility function to register CRUD routes for sub-models
function registerCVSubRoutes(model, modelName) {
  const basePath = `/resume/${modelName}`;

  // Create: Thêm cvId vào body để liên kết với CV cụ thể
  router.post(basePath, authenticateToken, async (req, res) => {
    try {
      const doc = new model({ ...req.body, userId: req.userId, cvId: req.body.cvId });
      await doc.save();
      res.status(201).json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all for current user: Lấy tất cả sub-models của một người dùng cho mỗi CV
  router.get(basePath, authenticateToken, async (req, res) => {
    try {
      const items = await model.find({ userId: req.userId, cvId: req.query.cvId });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update by ID: Cập nhật sub-model theo ID và cvId
  router.put(`${basePath}/:id`, authenticateToken, async (req, res) => {
    try {
      const item = await model.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId, cvId: req.body.cvId },
        req.body,
        { new: true }
      );
      if (!item) return res.status(404).json({ error: `${modelName} not found` });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete by ID: Xóa sub-model theo ID và cvId
  router.delete(`${basePath}/:id`, authenticateToken, async (req, res) => {
    try {
      const deleted = await model.findOneAndDelete({ _id: req.params.id, userId: req.userId, cvId: req.query.cvId });
      if (!deleted) return res.status(404).json({ error: `${modelName} not found` });
      res.json({ message: `${modelName} deleted successfully.` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Đăng ký các route CRUD cho các sub-models
registerCVSubRoutes(Education, 'education');
registerCVSubRoutes(WorkExperience, 'work-experience');
registerCVSubRoutes(Volunteering, 'volunteering');
registerCVSubRoutes(Publication, 'publication');
registerCVSubRoutes(Project, 'project');
registerCVSubRoutes(Profile, 'profile');
registerCVSubRoutes(Certification, 'certification');
registerCVSubRoutes(Award, 'award');
registerCVSubRoutes(Skill, 'skill');

// POST để tạo mới một resume (bao gồm các sub-models)
router.post('/resume', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.create({
      title: req.body.title, 
      userId: req.userId,
    });

    res.status(201).json({
      profile,
      message: 'Profile and related empty models created successfully!',
    });
  } catch (err) {
    console.error('Error creating resume:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET để lấy tất cả resumes của người dùng (bao gồm các sub-models)
router.get('/resume', authenticateToken, async (req, res) => {
  try {
    const profiles = await Profile.find({ userId: req.userId });

    const profilesWithDetails = await Promise.all(profiles.map(async (profile) => {
      const [education, workExperience, volunteering, publication, project, certification, award, skill] = await Promise.all([
        Education.find({ cvId: profile._id, userId: req.userId }),
        WorkExperience.find({ cvId: profile._id, userId: req.userId }),
        Volunteering.find({ cvId: profile._id, userId: req.userId }),
        Publication.find({ cvId: profile._id, userId: req.userId }),
        Project.find({ cvId: profile._id, userId: req.userId }),
        Certification.find({ cvId: profile._id, userId: req.userId }),
        Award.find({ cvId: profile._id, userId: req.userId }),
        Skill.find({ cvId: profile._id, userId: req.userId }),
      ]);

      return {
        profile,
        education,
        workExperience,
        volunteering,
        publication,
        project,
        certification,
        award,
        skill
      };
    }));

    res.json(profilesWithDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/resume/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const resumeId = req.params.id;

    const profile = await Profile.findOne({ _id: resumeId, userId });
    if (!profile) return res.status(404).json({ error: 'Resume not found' });

    const [education, workExperience, volunteering, publication, project, certification, award, skill] = await Promise.all([
      Education.find({ cvId: resumeId, userId }),
      WorkExperience.find({ cvId: resumeId, userId }),
      Volunteering.find({ cvId: resumeId, userId }),
      Publication.find({ cvId: resumeId, userId }),
      Project.find({ cvId: resumeId, userId }),
      Certification.find({ cvId: resumeId, userId }),
      Award.find({ cvId: resumeId, userId }),
      Skill.find({ cvId: resumeId, userId }),
    ]);

    res.json({
      profile,
      education,
      workExperience,
      volunteering,
      publication,
      project,
      certification,
      award,
      skill
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/resume/:id', authenticateToken, async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.userId;

    const deletedProfile = await Profile.findOneAndDelete({ _id: resumeId, userId });
    if (!deletedProfile) return res.status(404).json({ error: 'Resume not found' });

    const deleteConditions = { cvId: resumeId, userId };
    await Promise.all([
      Education.deleteMany(deleteConditions),
      WorkExperience.deleteMany(deleteConditions),
      Volunteering.deleteMany(deleteConditions),
      Publication.deleteMany(deleteConditions),
      Project.deleteMany(deleteConditions),
      Certification.deleteMany(deleteConditions),
      Award.deleteMany(deleteConditions),
      Skill.deleteMany(deleteConditions),
    ]);

    res.json({ message: 'Resume and all associated details deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;