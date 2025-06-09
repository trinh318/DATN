const jwt = require('jsonwebtoken');

// Hàm xác thực token
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
      if (err) {
        return reject(new Error("Invalid or expired token"));
      }
      if (!decoded.userId) {
        return reject(new Error("Token is missing userId"));
      }
      resolve(decoded);
    });
  });
};

// Middleware cho Socket.IO
const authenticateSocket = async (socket, next) => {
  const token =
    socket.handshake.headers['authorization']?.replace('Bearer ', '') ||
    socket.handshake.query.token;

  if (!token) {
    return next(new Error("Authentication error: Token is required"));
  }

  try {
    const decoded = await verifyToken(token);
    socket.user_id = decoded.userId; // Gắn userId vào socket
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    next(new Error("Authentication error: " + error.message));
  }
};

module.exports = authenticateSocket;
