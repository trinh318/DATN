const express = require('express');
const router = express.Router();
const TestAttempt = require('../models/TestAttempt');

// Define the route to handle the test attempt submission
router.post('/', async (req, res) => {
    try {
        const { test_id, user_id, answers, score, start_time, end_time } = req.body;
        const newTestAttempt = new TestAttempt({
            test_id,
            user_id,
            answers,
            score,
            start_time,
            end_time,
            status: 'Hoàn thành',
        });
        
        await newTestAttempt.save();
        res.status(201).json(newTestAttempt);  // Respond with the newly created attempt
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving test attempt' });
    }
});
router.get('/', async (req, res) => {
    const { user_id, test_id } = req.query;  // Lấy user_id và test_id từ query parameters

    try {
        // Tìm kiếm các lần tham gia bài kiểm tra của người dùng
        const attempts = await TestAttempt.find({ user_id, test_id }); 
        
        // Nếu không tìm thấy kết quả
        if (attempts.length === 0) {
            return res.status(404).json({ message: 'No test attempts found.' });
        }

        // Nếu tìm thấy thông tin bài kiểm tra
        res.json(attempts);
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Error fetching test attempts:', error);
        res.status(500).json({ message: 'Error fetching test attempts.' });
    }
});

module.exports = router;
