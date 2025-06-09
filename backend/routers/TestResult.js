const express = require('express');
const mongoose = require('mongoose');
const TestAttempt = require('../models/TestAttempt');
const TestAnswer = require('../models/TestAnswer');
const TestResult = require('../models/TestResult');
const TestQuestion = require('../models/TestQuestion');
const Test = require('../models/Test');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

// Route: Lấy danh sách câu hỏi của bài kiểm tra
router.get('/:testId/questions', async (req, res) => {
  try {
    const { testId } = req.params;

    // Tìm câu hỏi theo testId
    const questions = await TestQuestion.find({ test_id: testId });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi cho bài kiểm tra này' });
    }

    res.json(questions); // Trả về câu hỏi
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

// Route: Bắt đầu bài kiểm tra
router.post('/start/:testId', authenticateToken, async (req, res) => {
  const { testId } = req.params;
  const userId = req.userId;

  try {
    // Kiểm tra testId và userId
    if (!testId || !userId) {
      return res.status(400).json({ message: 'Test ID hoặc User ID không hợp lệ' });
    }

    // Lấy câu hỏi của bài kiểm tra
    const questions = await TestQuestion.find({ test_id: testId });

    // Kiểm tra nếu không có câu hỏi
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'Không có câu hỏi nào cho bài kiểm tra này' });
    }

    // Tạo bản ghi TestAttempt
    const testAttempt = new TestAttempt({
      test_id: testId,
      user_id: userId,
      start_time: new Date(),
      status: 'Đang làm',
    });

    await testAttempt.save();

    // Trả về kết quả
    res.status(200).json({
      message: 'Bài kiểm tra đã được bắt đầu',
      testAttemptId: testAttempt._id,
      questions: questions,
    });
  } catch (error) {
    console.error('Lỗi khi bắt đầu bài kiểm tra:', error.message);
    res.status(500).json({ message: 'Lỗi khi bắt đầu bài kiểm tra', error: error.message });
  }
});

// Route: Người dùng trả lời câu hỏi
router.post('/answer/:attemptId', authenticateToken, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, answer } = req.body;
    const userId = req.userId;

    // Kiểm tra TestAttempt có tồn tại không
    const testAttempt = await TestAttempt.findById(attemptId);
    if (!testAttempt) {
      return res.status(404).json({ message: 'Test attempt không tồn tại' });
    }

    // Kiểm tra câu hỏi có hợp lệ không
    const testQuestion = await TestQuestion.findOne({ _id: questionId, test_id: testAttempt.test_id });
    if (!testQuestion) {
      return res.status(404).json({ message: 'Câu hỏi không hợp lệ' });
    }

    // Kiểm tra câu trả lời đúng hay sai
    const isCorrect = answer === testQuestion.correct_answer;

    // Lưu kết quả trả lời
    const testAnswer = new TestAnswer({
      test_attempt_id: attemptId,
      question_id: questionId,
      answer,
      is_correct: isCorrect,
      points_awarded: isCorrect ? testQuestion.points : 0,
    });

    await testAnswer.save();

    res.status(200).json({ message: 'Câu trả lời đã được ghi nhận', testAnswer });
  } catch (error) {
    console.error('Lỗi khi ghi nhận câu trả lời:', error.message);
    res.status(500).json({ message: 'Lỗi server khi ghi nhận câu trả lời', error: error.message });
  }
});

// Route: Hoàn thành bài kiểm tra
router.post('/finish/:testAttemptId', authenticateToken, async (req, res) => {
  try {
    const { testAttemptId } = req.params;

    // Kiểm tra TestAttempt có tồn tại không
    const testAttempt = await TestAttempt.findById(testAttemptId);
    if (!testAttempt) {
      return res.status(404).json({ message: 'Test attempt không tồn tại' });
    }

    // Cập nhật thời gian kết thúc bài kiểm tra
    testAttempt.end_time = Date.now();
    testAttempt.status = 'Hoàn thành';
    await testAttempt.save();

    // Lấy tất cả các câu trả lời
    const testAnswers = await TestAnswer.find({ test_attempt_id: testAttemptId });

    // Tính điểm và số lượng câu trả lời đúng/sai
    const totalScore = testAnswers.reduce((score, answer) => score + answer.points_awarded, 0);
    const correctAnswers = testAnswers.filter(answer => answer.is_correct).length;
    const incorrectAnswers = testAnswers.length - correctAnswers;

    // Lưu kết quả vào TestResult
    const testResult = new TestResult({
      test_attempt_id: testAttemptId,
      total_score: totalScore,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
    });

    await testResult.save();

    // Trả về kết quả cuối
    res.status(200).json({
      message: 'Bài kiểm tra hoàn thành thành công',
      testResult: {
        total_score: totalScore,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
      }
    });
  } catch (error) {
    console.error('Lỗi khi hoàn thành bài kiểm tra:', error.message);
    res.status(500).json({ message: 'Lỗi server khi hoàn thành bài kiểm tra', error: error.message });
  }
});

module.exports = router;
