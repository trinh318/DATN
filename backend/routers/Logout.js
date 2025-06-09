const express = require('express');
const router = express.Router();

// Add the logout route
router.post('/logout', (req, res) => {
    try {
      // Clear the JWT token cookie on logout
      res.clearCookie('token', { path: '/' });  // Adjust path if needed
  
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error('Logout failed:', err);
      res.status(500).json({ message: 'Error during logout', error: err.message });
    }
  });  
 
module.exports = router;
