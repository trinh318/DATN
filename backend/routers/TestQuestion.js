const express = require('express');
const router = express.Router();
const TestQuestion = require('../models/TestQuestion');
const Test = require('../models/Test');
const authenticateToken = require('../middleware/authenticateToken');


// CREATE - Tạo câu hỏi mới cho bài kiểm tra
router.post('/:test_id/questions', authenticateToken, async (req, res) => {
  try {
    const { question, options, correct_answer, points } = req.body;
    const { test_id } = req.params;  // Lấy test_id từ URL

    // Kiểm tra bài kiểm tra có tồn tại không
    const test = await Test.findById(test_id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Tạo câu hỏi mới
    const newQuestion = new TestQuestion({
      test_id,
      question,
      options,
      correct_answer,
      points,
    });

    // Lưu câu hỏi vào cơ sở dữ liệu
    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
router.get('/:test_id/questions', async (req, res) => {
  try {
    const { test_id } = req.params;
    const questions = await TestQuestion.find({ test_id });
    
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi cho bài kiểm tra này' });
    }

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error });
  }
});

// READ - Lấy chi tiết câu hỏi theo ID
router.get('/question/:id', async (req, res) => {
  try {
    const testQuestion = await TestQuestion.findById(req.params.id);
    if (!testQuestion) return res.status(404).json({ message: 'Question not found' });

    res.json(testQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy tất cả câu hỏi của một bài kiểm tra
router.get('/:test_id/questions', async (req, res) => {
  try {
    const { test_id } = req.params;

    // Lấy tất cả câu hỏi của bài kiểm tra theo test_id
    const questions = await TestQuestion.find({ test_id });
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi cho bài kiểm tra này' });
    }

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error });
  }
});

// UPDATE - Cập nhật câu hỏi theo ID
router.put('/:id', async (req, res) => {
  try {
    const { question, options, correct_answer, points } = req.body;
    const updatedQuestion = await TestQuestion.findByIdAndUpdate(
      req.params.id,
      { question, options, correct_answer, points, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });

    res.json({ message: 'Question updated successfully', updatedQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE - Xóa câu hỏi theo ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedQuestion = await TestQuestion.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) return res.status(404).json({ message: 'Question not found' });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
