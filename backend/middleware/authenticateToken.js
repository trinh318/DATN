const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log("Received Authorization header:", authHeader);
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Lấy token từ header

  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    if (!decoded.userId) {
      return res.status(400).json({ message: 'Token is missing required fields (userId)' });
    }
    req.userId = decoded.userId;  // Lưu userId vào request để sử dụng sau này
    console.log('Authenticated user ID:', req.userId);
    next();  // Chuyển sang route handler
  });
};


module.exports = authenticateToken;  // Đảm bảo middleware này được export đúng
