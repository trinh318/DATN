const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const TestQuestion = require('../models/TestQuestion');


router.post("/create-test", async (req, res) => {
  try {
    const { title, description, duration, questions, userId } = req.body;

    // Tạo bài kiểm tra mới
    const newTest = new Test({
      title,
      description,
      duration,
      userId,
    });

    const savedTest = await newTest.save();

    // Lưu các câu hỏi liên quan
    const testQuestions = questions.map((q) => ({
      ...q,
      test_id: savedTest._id,
    }));

    await TestQuestion.insertMany(testQuestions);

    res.status(201).json({ message: "Test and questions created successfully!" });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ message: "Error creating test", error });
  }
});


router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const test = await Test.findById(id);
    if (!test) return res.status(404).json({ message: "Bài test không tồn tại" });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy chi tiết bài test" });
  }
});


router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Lọc bài kiểm tra theo employer_id (hoặc trường user_id nếu bạn lưu ID người tạo bài kiểm tra)
    const tests = await Test.find({ userId: userId });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


router.get("/", async (req, res) => {
  try {
    const tests = await Test.find(); // Lấy tất cả các bài kiểm tra
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Tìm bài kiểm tra theo ID
    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ message: "Bài kiểm tra không tồn tại" });
    }

    // Tìm tất cả câu hỏi liên quan đến bài kiểm tra
    const questions = await TestQuestion.find({ test_id: id });
    console.log("Questions:", questions);

    // Trả về bài kiểm tra cùng với các câu hỏi
    res.json({
      test_id:test._id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      created_at: test.created_at,
      updated_at: test.updated_at,
      questions: questions, // Câu hỏi liên quan đến bài kiểm tra
    });
  } catch (error) {
    console.error("Error fetching test details:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  console.log('Updated Data:', updatedData); // Check what data is being sent from frontend

  try {
    const existingTest = await Test.findById(id);
    if (!existingTest) return res.status(404).json({ message: "Test not found" });

    // Update the test details
    existingTest.title = updatedData.title || existingTest.title;
    existingTest.description = updatedData.description || existingTest.description;
    existingTest.duration = updatedData.duration || existingTest.duration;

    // Check if new questions are being added and update
    if (updatedData.questions && updatedData.questions.length > 0) {
      // Loop through the updated questions
      for (const q of updatedData.questions) {
        if (q._id) {
          // If question already exists (based on _id), update it
          await TestQuestion.updateOne({ _id: q._id }, q);
        } else {
          // Otherwise, it's a new question, so insert it
          await TestQuestion.create({ ...q, test_id: existingTest._id });
        }
      }
    }

    // Save the updated test
    const updatedTest = await existingTest.save();
    res.json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error); 
    res.status(500).json({ message: "Error updating test", error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm và xóa bài kiểm tra
    const deletedTest = await Test.findByIdAndDelete(id);

    // Kiểm tra nếu bài kiểm tra không tồn tại
    if (!deletedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Xóa các câu hỏi liên quan đến bài kiểm tra này
    await TestQuestion.deleteMany({ test_id: id });

    // Trả về thông báo thành công
    res.json({ message: 'Test and related questions deleted successfully' });
  } catch (error) {
    console.error('Error deleting test and questions:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Tìm kiếm bài kiểm tra theo loại
router.get('/search', async (req, res) => {
  try {
    const { type } = req.query;
    let filter = {};
    if (type) filter.type = type;

    const tests = await Test.find(filter);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:testId/questions', async (req, res) => {
  try {
    const { testId } = req.params;

    const questions = await TestQuestion.find({ test_id: testId });
    
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi cho bài kiểm tra này' });
    }

    // Assuming each test has a duration in minutes
    const test = await Test.findById(testId);
    const duration = test ? test.duration : 0; 

    res.json({ questions, duration });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});



module.exports = router;
