const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/Message');  // Assuming Message model is in the models folder
const authenticateToken = require('../middleware/authenticateToken');  // Ensure this is imported

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  const { to_user_id, message } = req.body;
  const from_user_id = req.userId;  // The user ID is now available via req.userId

  // Validate input
  if (!to_user_id || !message) {
    return res.status(400).json({ message: 'Recipient and message are required' });
  }

  // Ensure that to_user_id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(to_user_id)) {
    return res.status(400).json({ message: 'Invalid recipient ID format' });
  }

  try {
    // Create the message object and set a timestamp for when the message is sent
    const newMessage = new Message({
      from_user_id,
      to_user_id,
      message,
      sent_at: new Date(),  // Ensure you have a sent_at field in the Message model
    });

    // Save the message to the database
    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get all messages between two users
router.get('/chat/:user1/:user2', authenticateToken, async (req, res) => {
  const { user1, user2 } = req.params;

  // Ensure the userId from the token is being used correctly
  const fromUserId = req.userId;  // Get userId from the token

  console.log('Logged in user ID:', fromUserId);  // Debugging log

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    // Get messages exchanged between user1 and user2
    const messages = await Message.find({
      $or: [
        { from_user_id: user1, to_user_id: user2 },
        { from_user_id: user2, to_user_id: user1 }
      ]
    }).sort({ sent_at: 1 });  // Ensure sorting by timestamp if you want chronological order

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Error retrieving messages:', err);
    res.status(500).json({ message: 'Error retrieving messages', error: err.message });
  }
});

module.exports = router;
